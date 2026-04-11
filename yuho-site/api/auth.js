import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDb } from "../lib/db.js";
import { signToken, getUserFromReq } from "../lib/auth.js";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async function handler(req, res) {
  const db = await getDb();

  if (req.method === "POST") {
    const { action } = req.query;

    if (action === "register") {
      const { name, username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "아이디와 비밀번호를 입력하세요." });
      }

      if (username === ADMIN_USERNAME) {
        return res.status(403).json({ message: "이 아이디는 사용할 수 없습니다." });
      }

      const existing = await db.collection("users").findOne({ username });
      if (existing) {
        return res.status(409).json({ message: "이미 존재하는 아이디입니다." });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await db.collection("users").insertOne({
        name,
        username,
        passwordHash,
        role: "user",
        createdAt: new Date()
      });

      return res.status(201).json({
        message: "회원가입 완료",
        userId: result.insertedId
      });
    }

    if (action === "login") {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "아이디와 비밀번호를 입력하세요." });
      }

      // 1. 관리자 고정 계정 우선 검사
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const adminUser = {
          _id: "admin-fixed-id",
          username: ADMIN_USERNAME,
          name: "관리자",
          role: "admin"
        };

        const token = signToken(adminUser);

        return res.status(200).json({
          message: "관리자 로그인 성공",
          token,
          user: adminUser
        });
      }

      // 2. 일반 사용자 검사
      const user = await db.collection("users").findOne({ username });
      if (!user) {
        return res.status(401).json({ message: "아이디 또는 비밀번호가 틀립니다." });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: "아이디 또는 비밀번호가 틀립니다." });
      }

      const token = signToken({
        _id: user._id.toString(),
        username: user.username,
        role: "user"
      });

      return res.status(200).json({
        message: "로그인 성공",
        token,
        user: {
          _id: user._id.toString(),
          username: user.username,
          name: user.name || user.username,
          role: "user"
        }
      });
    }

    return res.status(400).json({ message: "잘못된 요청입니다." });
  }

  if (req.method === "GET") {
    const user = getUserFromReq(req);

    if (!user) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    if (user.role === "admin") {
      return res.status(200).json({
        user: {
          _id: "admin-fixed-id",
          username: ADMIN_USERNAME,
          role: "admin"
        }
      });
    }

    const dbUser = await db.collection("users").findOne(
      { _id: new ObjectId(user.id || user._id) },
      { projection: { passwordHash: 0 } }
    );

    if (!dbUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    return res.status(200).json({
      user: {
        _id: dbUser._id.toString(),
        username: dbUser.username,
        name: dbUser.name || dbUser.username,
        role: dbUser.role
      }
    });
  }

  return res.status(405).json({ message: "허용되지 않은 메서드입니다." });
}