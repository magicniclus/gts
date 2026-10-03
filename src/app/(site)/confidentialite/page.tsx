import { legalRoute } from "@/lib/legal-page";

const route = legalRoute("confidentialite");
export const generateMetadata = route.generateMetadata;
export default route.Page;
