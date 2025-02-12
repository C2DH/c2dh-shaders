import "../../src/style.css";
// import Introduction from "./IntroductionPage";
import LogoC2dh from "./LogoC2dhPage";
import ParticalsPage from "./ParticalsPage";
import MicInputPage from "./MicInputPage";
import MorphingPage from "./MorphingPage";

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => (
  <div className="Page">{children}</div>
);

const Page = {
  // Introduction: () => (
  //   <PageWrapper>
  //     <Introduction />
  //   </PageWrapper>
  // ),
  LogoC2dh: () => (
    <PageWrapper>
      <LogoC2dh />
    </PageWrapper>
  ),
  Particals: () => (
    <PageWrapper>
      <ParticalsPage />
    </PageWrapper>
  ),
  MicInput: () => (
    <PageWrapper>
      <MicInputPage />
    </PageWrapper>
  ),
  Morphing: () => (
    <PageWrapper>
      <MorphingPage />
    </PageWrapper>
  ),
};

export default Page;
