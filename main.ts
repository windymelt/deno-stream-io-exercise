import * as fs from "https://deno.land/std@0.177.0/node/fs.ts";
import * as st from "https://deno.land/std@0.177.0/node/stream.ts";
import split from "npm:split2";

type Result = {
  id: number;
  start: number;
  end: number;
  text: string;
};

const tr = new st.Transform({
  transform(chunk, encoding, callback) {
    const [id, time, text] = chunk.toString().split("\n");
    if (id === "" || time === "" || text === "") return;
    const [start, end] = time.split(" --> ").map((t: string) => {
      const [h, m, s] = t.split(":").map((t) => parseFloat(t));
      return h * 3600 + m * 60 + s;
    });
    const result: Result = { id: parseInt(id), start, end, text };
    callback(null, JSON.stringify(result) + "\n");
  }
});

const input = Deno.args[0];
const rs = fs.createReadStream(input);
const ws = fs.createWriteStream(`${input}.jsonl`);
const SEP = "\n\n";
await rs.pipe(split(SEP)).pipe(tr).pipe(ws);
