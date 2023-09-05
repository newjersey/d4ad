import { ReactElement } from "react";
import { Icon } from "@material-ui/core";
import { Layout } from "../components/Layout";
import { Client } from "../domain/Client";

interface Props {
  client: Client;
  headerText: string;
  children: ReactElement;
  className?: string;
}

export const ErrorBlock = ({
  headerText,
  children,
  className,
}: {
  headerText: string;
  children: ReactElement;
  className?: string;
}) => (
  <div className={`container errorBlock${className ? ` ${className}` : ""}`}>
    <div className="row">
      <div className="col-md-6 col-md-offset-3">
        <div className="alert-box mtxl">
          <div className="rounded-top bg-light-green pal fdr fac">
            <div className="text-xxl mrs fin vam">
              <Icon fontSize="inherit">error</Icon>
            </div>
            <h2 className="text-xl weight-500">{headerText}</h2>
          </div>
          <div className="pal">{children}</div>
        </div>
      </div>
    </div>
  </div>
);

export const ErrorPage = (props: Props): ReactElement => {
  return (
    <Layout noFooter client={props.client}>
      <ErrorBlock className={props.className} headerText={props.headerText}>
        {props.children}
      </ErrorBlock>
    </Layout>
  );
};
