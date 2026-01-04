import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRef } from "react";

export type SwapQuote = ReturnType<typeof useSwapQuote>["swapQuote"];

const useSwapQuote = (quoteRequest: QuoteRequest) => {
  return;
};

export default useSwapQuote;
