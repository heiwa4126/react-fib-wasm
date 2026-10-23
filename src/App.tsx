import { useState } from "react";
import "./App.css";

function FibButton({ n }: { n: number }) {
  const [count, setCount] = useState(n);

  function fib(num: number): number {
    if (num <= 1) return num;
    return fib(num - 1) + fib(num - 2);
  }

  return (
    <>
      <button type="button" className="counter" onClick={() => setCount((count) => count + 1)}>
        count={count}
      </button>{" "}
      fib({count})={fib(count)}
    </>
  );
}

function App() {
  return (
    <>
      <h1>react-fib-wasm</h1>
      <FibButton n={1} />
    </>
  );
}

export default App;
