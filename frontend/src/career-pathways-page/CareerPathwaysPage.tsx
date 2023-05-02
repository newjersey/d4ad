import { ReactElement, useEffect, useState } from "react";
import { RouteComponentProps } from "@reach/router";
import { Client } from "../domain/Client";
import { PageBanner } from "../components/PageBanner";
import { CareerPathwaysPageData, IndustryProps } from "../types/contentful";
import { Layout } from "../components/Layout";
import { IndustrySelector } from "../components/IndustrySelector";
import { FooterCta } from "../components/FooterCta";
import { IndustryBlock } from "../components/IndustryBlock";
import { OccupationDetail } from "../domain/Occupation";
import { Error } from "../domain/Error";
// import image from "../overlayImages/healthcare-mobile.png";
// import { OverlayTool } from "../components/OverlayTool";
import { OccupationBlock } from "../components/OccupationBlock";
import { useContentfulClient } from "../utils/useContentfulClient";
import { CAREER_PATHWAYS_PAGE_QUERY } from "../queries/careerPathways";
import { INDUSTRY_QUERY } from "../queries/industry";
import { CareerMaps } from "../components/CareerMaps";

interface Props extends RouteComponentProps {
  client: Client;
  id?: string;
}

export const CareerPathwaysPage = (props: Props): ReactElement<Props> => {
  const [industry, setIndustry] = useState<IndustryProps>();
  const [occupation, setOccupation] = useState<string>();
  const [occupationDetail, setOccupationDetail] = useState<OccupationDetail>();
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState<boolean>();

  const data: CareerPathwaysPageData = useContentfulClient({ query: CAREER_PATHWAYS_PAGE_QUERY });
  const industryData: {
    industryCollection: {
      items: IndustryProps[];
    };
  } = useContentfulClient({
    disable: !props.id,
    query: INDUSTRY_QUERY,
    variables: { slug: props.id },
  });

  useEffect(() => {
    if (industryData) {
      setIndustry(industryData?.industryCollection.items[0]);
    }
  }, [industryData]);

  useEffect(() => {
    if ((occupation !== undefined || occupation !== null || occupation !== "") && occupation) {
      setLoading(true);
      props.client.getOccupationDetailBySoc(occupation, {
        onSuccess: (result: OccupationDetail) => {
          setLoading(false);
          setError(undefined);
          setOccupationDetail(result);
        },
        onError: (error: Error) => {
          setLoading(false);
          setError(error);
        },
      });
    }
  }, [occupation]);

  return (
    <Layout
      client={props.client}
      theme="support"
      footerComponent={
        data && <FooterCta heading={data.page.footerCtaHeading} link={data.page.footerCtaLink} />
      }
    >
      {data && (
        <>
          <PageBanner {...data.page.pageBanner} date={data.page.sys.publishedAt} />
          <IndustrySelector industries={data.page.industries.items} current={industry?.slug} />

          {industry && (
            <>
              <IndustryBlock {...industry} />
              {industry.careerMaps?.items && industry.careerMaps?.items.length > 0 ? (
                <CareerMaps careerMaps={industry.careerMaps.items} icon={industry?.slug} />
              ) : (
                <>
                  {industry.inDemandCollection?.items &&
                    industry.inDemandCollection?.items.length > 0 && (
                      <OccupationBlock
                        content={occupationDetail}
                        industry={industry.shorthandTitle || industry.title}
                        inDemandList={industry.inDemandCollection?.items}
                        setOccupation={setOccupation}
                        error={error}
                        loading={loading}
                      />
                    )}
                </>
              )}
            </>
          )}
        </>
      )}
    </Layout>
  );
};
