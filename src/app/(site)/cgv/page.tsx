import { legalRoute } from "@/lib/legal-page";

const route = legalRoute("cgv");
export const generateMetadata = route.generateMetadata;
export default route.Page;
