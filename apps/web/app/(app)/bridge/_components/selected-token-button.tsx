import { Button } from "@anchore/ui/components/button";
import { ChevronDownIcon } from "lucide-react";
import { Chain, TokenBase } from "@/data/types";
import { getChainById } from "@/data";

interface SelectedTokenButtonProps {
  selectedToken: TokenBase | null;
  onSelectToken: () => void;
  isLoading?: boolean;
}

export function SelectedTokenButton({
  selectedToken,
  onSelectToken,
  isLoading,
}: SelectedTokenButtonProps) {
  const selectedChain = getChainById(selectedToken?.chainId || "");
  return (
    <Button
      variant="ghost"
      className="w-full justify-between h-auto p-4 border-b border-dashed border-border"
      onClick={onSelectToken}
      disabled={isLoading}
    >
      <div className="flex items-center gap-3">
        {/* TokenBase and Chain Icons */}
        <div className="relative">
          {/* TokenBase Icon */}
          {selectedToken?.logoURI ? (
            <img
              src={selectedToken.logoURI}
              alt={selectedToken.symbol}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-400" />
          )}

          {/* Chain Icon */}
          {selectedChain?.icon && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full p-0.5">
              <img
                src={selectedChain?.icon}
                alt={selectedChain.name}
                className="w-full h-full rounded-full"
              />
            </div>
          )}
        </div>

        {/* TokenBase Info */}
        <div className="text-left">
          {selectedToken ? (
            <>
              <div className="font-medium text-sm">{selectedToken.symbol}</div>
              <div className="text-xs text-muted-foreground">
                {selectedChain?.name || "Select Chain"}
              </div>
            </>
          ) : (
            <>
              <div className="font-medium text-sm">Select TokenBase</div>
              <div className="text-xs text-muted-foreground">Required</div>
            </>
          )}
        </div>
      </div>

      <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
    </Button>
  );
}
