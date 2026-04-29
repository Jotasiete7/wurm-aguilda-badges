import db from './src/lib/db.ts';

async function test() {
  const { data, error } = await db.from('users').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Columns:", Object.keys(data[0] || {}));
  }
}

test();
