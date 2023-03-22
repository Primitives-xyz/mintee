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
      header: () => <div className="text-left">Name</div>,
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
        <div className="bg-[#111C27]/75 w-fit h-10 rounded-xl flex px-4 justify-center items-center my-2">
          {userCreatedNFTs[0]?.id != null
            ? "Your NFTs"
            : "You have not created any NFTs yet."}
        </div>
      </div>
      {userCreatedNFTs[0]?.id != null && (
        <Table data={userCreatedNFTs} columns={columns} />
      )}
    </>
  );
}
