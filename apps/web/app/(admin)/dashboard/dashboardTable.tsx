"use client";
import { createColumnHelper } from "@tanstack/react-table";
import { prismaModels } from "mintee-database";
import Table from "./table";

export default function DashboardTable({
  userCreatedNFTs,
}: {
  userCreatedNFTs: any[];
}) {
  const columnHelper = createColumnHelper<prismaModels.NFT>();

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (row) => <div className="text-left">{row.getValue()}</div>,
    }),
    columnHelper.accessor("symbol", {
      header: "Description",
    }),
    columnHelper.accessor("blockchainAddress", {
      header: "Blockchain Address",
    }),
    columnHelper.accessor("isCompressed", {
      header: "Is Compressed",
      cell: (row) => (row.getValue() ? "Yes" : "No"),
    }),
  ];
  return (
    <>
      <div className="w-full flex justify-center items-center text-xl font-bold ">
        <div className="bg-[#111C27]/75 w-48 rounded-xl flex justify-center items-center my-2">
          NFTs Minted
        </div>
      </div>
      <Table data={userCreatedNFTs} columns={columns} />
    </>
  );
}
