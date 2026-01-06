"use client";

import { useMutation } from "@tanstack/react-query";

interface MintTokenParams {
  tokenAddress: string;
  amount: string;
}

export function useMintToken() {
  return useMutation({
    mutationFn: async ({ tokenAddress, amount }: MintTokenParams) => {
      // return await mintToken(tokenAddress, amount);
    },
  });
}
