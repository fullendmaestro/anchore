"use client";

import { useState } from "react";
import { Button } from "@anchore/ui/components/button";
import { Input } from "@anchore/ui/components/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@anchore/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@anchore/ui/components/table";
import { Badge } from "@anchore/ui/components/badge";
import { LIQUIDITY_POOLS } from "@/data/pools";
import { AddLiquidityModal } from "./add-liquidity-modal";
import { LiquidityPool } from "@/data/pools";
import Image from "next/image";
import { Search, TrendingUp, Droplet } from "lucide-react";

export function LiquidityPoolsCard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredPools = LIQUIDITY_POOLS.filter((pool) =>
    `${pool.token0Symbol}/${pool.token1Symbol}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleAddLiquidity = (pool: LiquidityPool) => {
    setSelectedPool(pool);
    setModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Liquidity Pools
            </h1>
            <p className="text-lg text-slate-400 font-light mt-2 max-w-2xl">
              Provide liquidity to cross-chain pairs and earn 0.3% of all trades
              proportional to your share.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary/60 uppercase tracking-wider">
                  Total Value Locked
                </span>
                <Droplet className="w-5 h-5 text-primary" />
              </div>
              <div className="text-3xl font-black text-white">$13.3M</div>
              <div className="text-xs text-slate-400 mt-1">
                Across all pools
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  24h Volume
                </span>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-white">$3.4M</div>
              <div className="text-xs text-emerald-400 mt-1">
                +12.5% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  24h Fees
                </span>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="text-3xl font-black text-white">$10.1K</div>
              <div className="text-xs text-slate-400 mt-1">Earned by LPs</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search pools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface-dark border-border-dark text-white"
            />
          </div>
          <Button
            variant="outline"
            className="border-border-dark hover:bg-border-dark"
            disabled
          >
            My Positions
          </Button>
        </div>

        {/* Pools Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Pool</TableHead>
                <TableHead className="text-right">TVL</TableHead>
                <TableHead className="text-right">24h Volume</TableHead>
                <TableHead className="text-right">24h Fees</TableHead>
                <TableHead className="text-right">APR</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-slate-400">No pools found</div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPools.map((pool) => (
                  <TableRow
                    key={pool.address}
                    className="hover:bg-primary/5 cursor-pointer group h-20"
                  >
                    {/* Pool Name */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <Image
                            src={pool.token0Logo}
                            alt={pool.token0Symbol}
                            width={32}
                            height={32}
                            className="rounded-full border-2 border-surface-dark"
                          />
                          <Image
                            src={pool.token1Logo}
                            alt={pool.token1Symbol}
                            width={32}
                            height={32}
                            className="rounded-full border-2 border-surface-dark"
                          />
                        </div>
                        <div>
                          <div className="text-white font-bold">
                            {pool.token0Symbol}/{pool.token1Symbol}
                          </div>
                          <div className="text-xs text-slate-400">
                            Anchore Pool
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* TVL */}
                    <TableCell className="text-right py-4">
                      <div className="text-white font-semibold">
                        {pool.totalValueLocked}
                      </div>
                      <div className="text-xs text-slate-400">
                        {pool.reserve0} {pool.token0Symbol}
                      </div>
                    </TableCell>

                    {/* 24h Volume */}
                    <TableCell className="text-right py-4">
                      <div className="text-white font-semibold">
                        {pool.volume24h}
                      </div>
                    </TableCell>

                    {/* 24h Fees */}
                    <TableCell className="text-right py-4">
                      <div className="text-emerald-400 font-semibold">
                        {pool.fees24h}
                      </div>
                    </TableCell>

                    {/* APR */}
                    <TableCell className="text-right py-4">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                        {pool.apr}
                      </Badge>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right py-4">
                      <Button
                        size="sm"
                        onClick={() => handleAddLiquidity(pool)}
                        className="bg-primary hover:bg-primary/90 text-background-dark font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Add Liquidity
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <Droplet className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold mb-1">
                  How Liquidity Pools Work
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  When you add liquidity, you&apos;ll receive LP tokens
                  representing your share of the pool. You&apos;ll earn 0.3% of
                  all trades proportional to your share. Withdraw your liquidity
                  at any time by returning your LP tokens.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Liquidity Modal */}
      <AddLiquidityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        pool={selectedPool}
      />
    </>
  );
}
