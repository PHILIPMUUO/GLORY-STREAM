import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { type } = req.query;

    if (!type || (type !== 'daily' && type !== 'discipleship')) {
        return res.status(400).json({ error: 'Invalid post type' });
    }

    if (req.method === 'GET') {
        const posts = await kv.get(type);
        return res.status(200).json(posts || []);
    }

    if (req.method === 'POST') {
        const { id, title, scripture, content, date } = req.body;
        let posts = (await kv.get(type)) || [];

        if (id) {
            const index = posts.findIndex(p => p.id === parseInt(id));
            if (index !== -1) {
                posts[index] = { ...posts[index], title, scripture, content, date };
            }
        } else {
            const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
            posts.push({ id: newId, title, scripture, content, date });
        }

        await kv.set(type, posts);
        return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
        const { id } = req.body;
        let posts = (await kv.get(type)) || [];
        posts = posts.filter(p => p.id !== parseInt(id));
        await kv.set(type, posts);
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}