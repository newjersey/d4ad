import { RouteComponentProps } from "@reach/router";
import { ReactElement, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Client } from "../domain/Client";
import { FinancialResourcePageData, FinancialResourcePageProps } from "../types/contentful";
import { PageBanner } from "../components/PageBanner";
import { FinancialResourceFilter } from "../components/FinancialResourceFilter";
import { FinancialResource } from "../components/FinancialResource";
import { ContentfulRichText } from "../components/ContentfulRichText";

interface Props extends RouteComponentProps {
  client: Client;
}

export const FinancialPage = (props: Props): ReactElement => {
  const [data, setData] = useState<FinancialResourcePageData>();

  useEffect(() => {
    props.client.getContentfulFRP("frp", {
      onSuccess: (response: FinancialResourcePageProps) => {
        setData(response.data.data);
      },
      onError: (e) => {
        console.log(`An error, maybe an error code: ${e}`);
      },
    });
  }, [props.client]);

  const breadCrumbs = [
    {
      text: "Home",
      href: "/",
    },
    {
      text: "Financial Resources",
    },
  ];

  return (
    <Layout
      client={props.client}
      footerComponent={
        data?.page.footerBannerTitle && data?.page.footerBannerCopy ? (
          <div className="footer-banner">
            <div className="container">
              <h3>{data?.page.footerBannerTitle}</h3>
              <ContentfulRichText document={data?.page.footerBannerCopy?.json} />
            </div>
          </div>
        ) : undefined
      }
    >
      <PageBanner
        breadCrumbs={breadCrumbs}
        heading={`${data?.page.bannerHeading}`}
        image={`${data?.page.bannerImage?.url}`}
        message={data?.page.bannerCopy}
      />
      <section className="resource-filter">
        <div className="container">
          <FinancialResourceFilter education={data?.education} funding={data?.funding} />
          <div className="content">
            <div className="heading">
              <h3>showing 11 out of 11</h3>
            </div>
            {data?.resources.items.map((resource) => (
              <FinancialResource key={resource.sys?.id} {...resource} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};
