import { Button } from "@anchore/ui/components/button";
import { ChevronDownIcon } from "lucide-react";
import { CasperToken } from "@/data/casper-tokens";
import Image from "next/image";

interface SelectedTokenButtonProps {
  selectedToken: CasperToken | null;
  onSelectToken: () => void;
  isLoading?: boolean;
}

export function SelectedTokenButton({
  selectedToken,
  onSelectToken,
  isLoading,
}: SelectedTokenButtonProps) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-between h-auto p-4 border-b border-dashed border-border"
      onClick={onSelectToken}
      disabled={isLoading}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          {selectedToken?.icon ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-lg font-bold">{selectedToken.symbol[0]}</span>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-400" />
          )}
          
          {/* Casper Network Badge */}
          {selectedToken && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full p-0.5 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#FF0011] flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">C</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-left">
          {selectedToken ? (
            <>
              <div className="font-medium text-sm">{selectedToken.symbol}</div>
              <div className="text-xs text-muted-foreground">Casper Network</div>
            </>
          ) : (
            <>
              <div className="font-medium text-sm">Select Token</div>
              <div className="text-xs text-muted-foreground">Required</div>
            </>
          )}
        </div>
      </div>

      <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
    </Button>
  );
}
