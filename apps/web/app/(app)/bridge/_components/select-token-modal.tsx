import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@anchore/ui/components/dialog";
import { Input } from "@anchore/ui/components/input";
import { useState, useMemo } from "react";
import { getTokensByChain, CHAINS } from "@/data";
import { TokenBase, Chain } from "@/data/types";
import { SelectedTokenButton } from "./selected-token-button";

interface Props {
  modalState: {
    screen: "select-buy-token" | "select-sell-token";
    isOpen: boolean;
  };
  selectedToken: TokenBase | null;
  onSelectToken: (token: TokenBase, chain: Chain) => void;
  onClose: () => void;
}

export function SelectTokenModal({
  modalState,
  selectedToken,
  onSelectToken,
  onClose,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChainFilter, setSelectedChainFilter] = useState<Chain | null>(
    null
  );

  const filteredTokens = useMemo(() => {
    let tokens = selectedChainFilter
      ? getTokensByChain(selectedChainFilter.chainId)
      : CHAINS.flatMap((chain) => getTokensByChain(chain.chainId));

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tokens = tokens.filter(
        (token) =>
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query) ||
          token.address.toLowerCase().includes(query)
      );
    }

    return tokens;
  }, [searchQuery, selectedChainFilter]);

  return (
    <Dialog open={modalState.isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select TokenBase</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <Input
            placeholder="Search by token or address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />

          {/* Chain Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedChainFilter(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !selectedChainFilter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All Chains
            </button>
            {CHAINS.map((chain) => (
              <button
                key={chain.chainId}
                onClick={() => setSelectedChainFilter(chain)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                  selectedChainFilter?.chainId === chain.chainId
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <img src={chain.icon} alt={chain.name} className="w-3 h-3" />
                {chain.name}
              </button>
            ))}
          </div>

          {/* TokenBase List */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {filteredTokens.map((token) => {
              const chain = CHAINS.find((c) => c.chainId === token.chainId)!;
              const isSelected =
                selectedToken?.address === token.address &&
                selectedToken?.chainId === token.chainId;

              return (
                <button
                  key={`${token.chainId}-${token.address}`}
                  onClick={() => {
                    onSelectToken(token, chain);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                    isSelected ? "bg-secondary" : "hover:bg-secondary/50"
                  }`}
                >
                  <div className="relative">
                    {token.logoURI ? (
                      <img
                        src={token.logoURI}
                        alt={token.symbol}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400" />
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-background rounded-full p-0.5">
                      <img
                        src={chain.icon}
                        alt={chain.name}
                        className="w-full h-full rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{token.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {token.name}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {chain.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
