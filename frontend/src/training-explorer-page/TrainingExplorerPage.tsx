import { RouteComponentProps } from "@reach/router";
import { ReactElement } from "react";
import { Layout } from "../components/Layout";
import { Client } from "../domain/Client";
import { useContentfulClient } from "../utils/useContentfulClient";
import { TRAINING_EXPLORER_PAGE_QUERY } from "../queries/trainingExplorer";
import { TrainingExplorerPageProps } from "../types/contentful";
import { PageBanner } from "../components/PageBanner";
import { SearchBlock } from "../components/SearchBlock";
import { HowTo } from "../components/HowTo";
import { Accordion } from "../components/Accordion";
import { Interrupter } from "../components/Interrupter";
import { CtaBanner } from "../components/CtaBanner";
import { IconNames } from "../types/icons";

interface Props extends RouteComponentProps {
  client: Client;
}

export const TrainingExplorerPage = (props: Props): ReactElement => {
  const data: TrainingExplorerPageProps = useContentfulClient({
    query: TRAINING_EXPLORER_PAGE_QUERY,
  });

  const pageData = data?.trainingExplorerPage;

  const howToContent = {
    header: "How to use the Training Explorer",
    video: pageData?.demoVideoUrl,
    steps: [
      {
        heading: pageData?.stepOneHeading,
        icon: pageData?.stepOneIcon,
        description: pageData?.stepOneText,
      },
      {
        heading: pageData?.stepTwoHeading,
        icon: pageData?.stepTwoIcon,
        description: pageData?.stepTwoText,
      },
      {
        heading: pageData?.stepThreeHeading,
        icon: pageData?.stepThreeIcon,
        description: pageData?.stepThreeText,
      },
    ],
  };

  const interrupterContent = {
    header: pageData?.interrupterBannerHeading,
    links: pageData?.interrupterLinksCollection.items,
  };

  return (
    <Layout
      client={props.client}
      footerComponent={
        <>
          <CtaBanner
            heading="Don't see your question?"
            noIndicator
            inlineButtons
            links={[
              {
                sys: {
                  id: "SeeallFAQs",
                },
                copy: "See all FAQs",
                url: "/faq",
                iconSuffix: "ArrowRight" as IconNames,
              },
            ]}
            theme="blue"
          />
          <CtaBanner
            heading={pageData?.footerCtaHeading}
            inlineButtons
            noIndicator
            links={pageData?.footerCtaLinkCollection.items}
            theme="blue"
          />
        </>
      }
    >
      {data && (
        <>
          <PageBanner {...pageData?.pageBanner} theme="green" />
          <SearchBlock />
          <HowTo {...howToContent} />
          <Interrupter {...interrupterContent} />
          <section className="landing-faq">
            <div className="container">
              <h3>Frequently Asked Questions</h3>
              {pageData?.faqsCollection.items.map((item, index: number) => (
                <Accordion
                  keyValue={index}
                  content={item.answer.json}
                  title={item.question}
                  key={item.sys?.id}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </Layout>
  );
};