import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@anchore/ui/components/dialog";
import { Input } from "@anchore/ui/components/input";
import { useState, useMemo } from "react";
import { CASPER_TOKENS, CasperToken } from "@/data/casper-tokens";
import { Badge } from "@anchore/ui/components/badge";

interface Props {
  modalState: {
    screen: "select-from-token" | "select-to-token";
    isOpen: boolean;
  };
  selectedToken: CasperToken | null;
  onSelectToken: (token: CasperToken) => void;
  onClose: () => void;
}

export function SelectTokenModal({
  modalState,
  selectedToken,
  onSelectToken,
  onClose,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = useMemo(() => {
    let tokens = CASPER_TOKENS;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tokens = tokens.filter(
        (token) =>
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query) ||
          token.hash.toLowerCase().includes(query)
      );
    }

    return tokens;
  }, [searchQuery]);

  return (
    <Dialog open={modalState.isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Token</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <Input
            placeholder="Search by token or hash"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />

          {/* Network Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#FF0011]" />
              Casper Network
            </Badge>
            <span className="text-xs text-muted-foreground">
              {filteredTokens.length} token{filteredTokens.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Token List */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {filteredTokens.map((token) => (
              <button
                key={token.hash}
                onClick={() => {
                  onSelectToken(token);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  selectedToken?.hash === token.hash
                    ? "bg-primary/10 border border-primary"
                    : "hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <span className="text-lg font-bold">{token.symbol[0]}</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{token.symbol}</div>
                    <div className="text-xs text-muted-foreground">{token.name}</div>
                  </div>
                </div>
                
                {selectedToken?.hash === token.hash && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}

            {filteredTokens.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tokens found
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t text-xs text-muted-foreground text-center">
            More tokens coming soon on Casper Network
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
