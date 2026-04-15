// 서버 메모리 저장소 (DB 연결 전 임시 저장용)
let posts = [];

export default function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET') {
        // 최신순으로 정렬하여 반환
        return res.status(200).json(posts.slice().sort((a, b) => b.id - a.id));
    }

    if (req.method === 'POST') {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: "제목과 내용을 입력해주세요." });
        }

        const newPost = {
            id: Date.now(),
            title,
            content,
            author: "익명",
            date: new Date().toLocaleDateString("ko-KR")
        };

        posts.push(newPost);
        return res.status(201).json(newPost);
    }

    res.status(405).json({ message: "Method Not Allowed" });
}
