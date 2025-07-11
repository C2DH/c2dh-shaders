import "../../src/style.css";
// import Introduction from "./IntroductionPage";
import LogoC2dh from "./LogoC2dhPage";
import ParticalsPage from "./ParticalsPage";
import MicInputPage from "./MicInputPage";
import MorphingPage from "./MorphingPage";
import EarthPage from "./EarthPage";
import SoundwavePage from "./SoundwavePage";

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
  Earth: () => (
    <PageWrapper>
      <EarthPage />
    </PageWrapper>
  ),
    Soundwave: () => (
    <PageWrapper>
      <SoundwavePage />
    </PageWrapper>
  ),
};

export default Page;
