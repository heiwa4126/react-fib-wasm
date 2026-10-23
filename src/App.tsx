import { useEffect, useState } from "react";
import "./App.css";
import { fib as fibWasm } from "@heiwa4126/fib-wasm";

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

function FibButtonWasm({ n }: { n: number }) {
  const [result, setResult] = useState<{ count: number; value: number } | null>(null);
  const [count, setCount] = useState(n);

  useEffect(() => {
    let ignore = false;

    void fibWasm(count).then((value) => {
      if (!ignore) setResult({ count, value });
    });

    return () => {
      ignore = true;
    };
  }, [count]);

  return (
    <>
      <button type="button" className="counter" onClick={() => setCount((count) => count + 1)}>
        count={count}
      </button>{" "}
      fib({count})={result?.count === count ? result.value : "..."}
    </>
  );
}

function App() {
  return (
    <>
      <h1>react-fib-wasm</h1>
      <h2>JavaScript Fibonacci</h2>
      <div>
        <FibButton n={1} />
      </div>
      <h2>WebAssembly Fibonacci</h2>
      <div>
        <FibButtonWasm n={1} />
      </div>
    </>
  );
}

export default App;
