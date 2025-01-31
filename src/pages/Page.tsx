import Introduction from "./IntroductionPage";
import "../../src/style.css";
import LogoC2dh from "./LogoC2dhPage";

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => (
  <div className="Page">{children}</div>
);

const Page = {
  Introduction: () => (
    <PageWrapper>
      <Introduction />
    </PageWrapper>
  ),
  LogoC2dh: () => (
    <PageWrapper>
      <LogoC2dh />
    </PageWrapper>
  ),
};

export default Page;
