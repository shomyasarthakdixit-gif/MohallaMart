async function run() {
  const res = await fetch("http://localhost:5000/api/v1/ai/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "Bread" })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
