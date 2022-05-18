import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { BetaBanner } from "../components/BetaBanner";
import React, { ReactElement, useEffect } from "react";
import { Link, RouteComponentProps } from "@reach/router";
import { Trans, useTranslation } from "react-i18next";

const LINKS = {
  sectionThreeLink:
    "https://careerconnections.nj.gov/careerconnections/plan/support/njccsites/one_stop_career_centers.shtml",
  purpleBoxLink:
    "https://careerconnections.nj.gov/careerconnections/plan/support/njccsites/one_stop_career_centers.shtml",
};

export const FundingPage = (_props: RouteComponentProps): ReactElement => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("FundingPage.pageTitle");
  }, [t]);

  return (
    <>
      <Header />
      <BetaBanner />

      <main className="container below-banners">
        <div className="row">
          <div className="col-sm-12">
            <h2 className="text-xl pvd weight-500">{t("FundingPage.header")}</h2>
          </div>

          <div className="col-sm-8">
            <h3 className="text-l ptd weight-500">{t("FundingPage.sectionOneHeader")}</h3>
            <p>{t("FundingPage.sectionOneText")}</p>

            <h3 className="text-l ptd weight-500">{t("FundingPage.sectionTwoHeader")}</h3>
            <p>
              <Trans i18nkey="FundingPage.sectionTwoText">
                Training that leads to an{" "}
                <Link className="link-format-blue" to="/in-demand-occupations">
                  in-demand occupation
                </Link>
              </Trans>{" "}
              can qualify for funding but your local One Stop will make the final determination. As
              we mentioned under “How Does Funding Work”, these types of occupations are expected to
              have the most openings in the future in the State of New Jersey. This list of
              occupations can be used by career counselors to help you make decisions about careers
              advancements and training.
            </p>

            <h3 className="text-l ptd weight-500">{t("FundingPage.sectionThreeHeader")}</h3>
            <p>
              <a
                className="link-format-blue"
                target="_blank"
                rel="noopener noreferrer"
                href={LINKS.sectionThreeLink}
              >
                {t("FundingPage.sectionThreeLinkText")}
              </a>
              {t("FundingPage.sectionThreeText")}
            </p>
          </div>

          <div className="col-sm-4 mbm">
            <div className="bg-light-purple pam bradl">
              <h3 className="text-l weight-500">{t("FundingPage.purpleBoxHeader")}</h3>
              <p>
                {t("FundingPage.purpleBoxText")}
                <a
                  className="link-format-blue"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={LINKS.purpleBoxLink}
                >
                  {t("FundingPage.purpleBoxLinkText")}
                </a>
                .
              </p>
            </div>

            <div className="bg-light-green pam mtm bradl">
              <h3 className="text-l ptd weight-500">{t("FundingPage.greenBoxHeader")}</h3>
              <p>
                <Trans i18nkey="FundingPage.greenBoxText">
                  In-Demand occupations are expected to have the most openings in the future in the
                  State of New Jersey. Trainings related to{" "}
                  <Link className="link-format-blue" to="/in-demand-occupations">
                    occupations on this list
                  </Link>
                </Trans>{" "}
                can be eligible for funding by the State.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};
