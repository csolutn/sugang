import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const client = new MongoClient(process.env.MONGODB_URI);

function verify(req){
  const auth = req.headers.authorization || "";
  return jwt.verify(auth.replace("Bearer ", ""), process.env.JWT_SECRET);
}

export default async function handler(req, res){
  if(req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  let user;
  try{ user = verify(req); }
  catch{ return res.status(401).json({ error: "로그인이 필요합니다." }); }

  const { id } = req.query;
  if(!id || !ObjectId.isValid(id))
    return res.status(400).json({ error: "잘못된 ID입니다." });

  await client.connect();
  const col = client.db("sugang").collection("roadmaps");
  const rd = await col.findOne({ _id: new ObjectId(id), sid: user.sid });

  if(!rd) return res.status(404).json({ error: "로드맵을 찾을 수 없습니다." });
  return res.status(200).json(rd);
}
