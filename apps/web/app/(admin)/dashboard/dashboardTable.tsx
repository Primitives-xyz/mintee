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
      <Table data={userCreatedNFTs} columns={columns} />
    </>
  );
}
