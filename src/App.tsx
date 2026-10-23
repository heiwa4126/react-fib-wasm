import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import "./App.css";
import { fib as fibWasm } from "@heiwa4126/fib-wasm";

const queryClient = new QueryClient();

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
  const [count, setCount] = useState(n);
  const { data, isPending, isError } = useQuery({
    queryKey: ["fib-wasm", count],
    queryFn: () => fibWasm(count),
    staleTime: Infinity,
    retry: false,
  });

  return (
    <>
      <button type="button" className="counter" onClick={() => setCount((count) => count + 1)}>
        count={count}
      </button>{" "}
      fib({count})={isPending ? "..." : isError ? "計算エラー" : data}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <h1>react-fib-wasm</h1>
      <h2>JavaScript Fibonacci</h2>
      <div>
        <FibButton n={1} />
      </div>
      <h2>WebAssembly Fibonacci</h2>
      <div>
        <FibButtonWasm n={1} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
