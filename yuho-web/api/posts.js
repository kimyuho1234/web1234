// 서버 메모리 저장소 (주의: Vercel은 서버리스라 일정 시간 뒤 메모리가 초기화됩니다)
let posts = [];

export default function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    // 1. 게시글 조회 (GET)
    if (req.method === 'GET') {
        return res.status(200).json(posts.slice().sort((a, b) => b.id - a.id));
    }

    // 2. 게시글 등록 (POST)
    if (req.method === 'POST') {
        const { title, content, author } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: "제목과 내용을 입력해주세요." });
        }

        const newPost = {
            id: Date.now().toString(), // ID를 문자열로 관리하는 것이 안정적입니다
            title,
            content,
            author: author || "익명",
            date: new Date().toLocaleDateString("ko-KR")
        };

        posts.push(newPost);
        return res.status(201).json(newPost);
    }

    // 3. 게시글 수정 (PUT)
    if (req.method === 'PUT') {
        const { id } = req.query;
        const { title, content } = req.body;
        
        const index = posts.findIndex(p => p.id === id);
        if (index !== -1) {
            posts[index] = { ...posts[index], title, content };
            return res.status(200).json(posts[index]);
        }
        return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    // 4. 게시글 삭제 (DELETE)
    if (req.method === 'DELETE') {
        const { id } = req.query;
        
        const initialLength = posts.length;
        posts = posts.filter(p => p.id !== id);
        
        if (posts.length < initialLength) {
            return res.status(200).json({ message: "삭제 성공" });
        }
        return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    res.status(405).json({ message: "Method Not Allowed" });
}