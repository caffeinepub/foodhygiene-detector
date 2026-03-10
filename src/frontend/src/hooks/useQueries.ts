import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export function useHasApiKey() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["hasApiKey"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasApiKey();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApiKey() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.setApiKey(key);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hasApiKey"] });
    },
  });
}

export function useGetAllRecords() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["records"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnalyzeAndStore() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      imageBytes,
      category,
    }: { imageBytes: Uint8Array<ArrayBuffer>; category: string }) => {
      if (!actor) throw new Error("Actor not ready");
      const blob = ExternalBlob.fromBytes(imageBytes);
      return actor.analyzeAndStore(blob, category);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["records"] });
    },
  });
}

export function useDeleteRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteRecord(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["records"] });
    },
  });
}
