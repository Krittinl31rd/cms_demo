import { useEffect } from "react";
import useStore from "@/store/store";

const useBreadcrumb = (segments = []) => {
  const setBreadcrumb = useStore((state) => state.setBreadcrumb);

  useEffect(() => {
    setBreadcrumb(segments);
    return () => setBreadcrumb([]);
  }, [JSON.stringify(segments)]);
};

export default useBreadcrumb;
