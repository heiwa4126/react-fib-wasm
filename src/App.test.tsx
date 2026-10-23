import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { fib as fibWasm } from "@heiwa4126/fib-wasm";
import App from "./App";

vi.mock("@heiwa4126/fib-wasm", () => ({ fib: vi.fn() }));

const mockFibWasm = vi.mocked(fibWasm);

function deferredResult() {
  let resolve!: (value: number) => void;
  const promise = new Promise<number>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function wasmOutput() {
  return within(screen.getAllByRole("button")[1].parentElement!);
}

beforeEach(() => {
  mockFibWasm.mockReset();
  mockFibWasm.mockResolvedValue(1);
});

afterEach(() => {
  cleanup();
});

describe("App", () => {
  it("updates the JavaScript result without changing the WASM counter", async () => {
    const user = userEvent.setup();
    render(<App />);
    const javascriptButton = screen.getAllByRole("button")[0];
    const javascriptOutput = within(javascriptButton.parentElement!);

    expect(javascriptOutput.getByText("fib(1)=1")).toBeDefined();
    await user.click(javascriptButton);
    expect(javascriptOutput.getByText("fib(2)=1")).toBeDefined();
    await user.click(javascriptButton);
    expect(javascriptOutput.getByText("fib(3)=2")).toBeDefined();
    expect(wasmOutput().getByRole("button", { name: "count=1" })).toBeDefined();
  });

  it("shows a pending state before displaying the initial WASM result", async () => {
    const pending = deferredResult();
    mockFibWasm.mockReturnValue(pending.promise);
    render(<App />);

    expect(wasmOutput().getByText("fib(1)=...")).toBeDefined();
    expect(mockFibWasm).toHaveBeenCalledWith(1);

    await act(async () => {
      pending.resolve(1);
      await pending.promise;
    });

    expect(await wasmOutput().findByText("fib(1)=1")).toBeDefined();
  });

  it("shows a pending state for a new count instead of the previous result", async () => {
    const user = userEvent.setup();
    const pending = deferredResult();
    mockFibWasm.mockResolvedValueOnce(1).mockReturnValueOnce(pending.promise);
    render(<App />);
    await wasmOutput().findByText("fib(1)=1");

    await user.click(wasmOutput().getByRole("button"));

    expect(wasmOutput().getByText("fib(2)=...")).toBeDefined();
    expect(mockFibWasm).toHaveBeenLastCalledWith(2);

    await act(async () => {
      pending.resolve(1);
      await pending.promise;
    });

    expect(await wasmOutput().findByText("fib(2)=1")).toBeDefined();
  });

  it("shows an error when the WASM calculation rejects without retrying", async () => {
    mockFibWasm.mockRejectedValue(new Error("Calculation failed"));
    render(<App />);

    expect(await wasmOutput().findByText("fib(1)=計算エラー")).toBeDefined();
    expect(mockFibWasm).toHaveBeenCalledTimes(1);
  });

  it("does not replace the current result when an older calculation finishes later", async () => {
    const user = userEvent.setup();
    const older = deferredResult();
    const newer = deferredResult();
    mockFibWasm.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    render(<App />);

    await user.click(wasmOutput().getByRole("button"));
    expect(wasmOutput().getByText("fib(2)=...")).toBeDefined();

    await act(async () => {
      newer.resolve(1);
      await newer.promise;
    });
    await wasmOutput().findByText("fib(2)=1");

    await act(async () => {
      older.resolve(999);
      await older.promise;
    });

    expect(wasmOutput().getByText("fib(2)=1")).toBeDefined();
    expect(wasmOutput().queryByText(/999/)).toBeNull();
  });
});
