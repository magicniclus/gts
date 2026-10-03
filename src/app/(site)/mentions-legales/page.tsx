import { legalRoute } from "@/lib/legal-page";

const route = legalRoute("mentions-legales");
export const generateMetadata = route.generateMetadata;
export default route.Page;
