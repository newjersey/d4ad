import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { Client, Observer } from "../domain/Client";
import { act } from "react-dom/test-utils";
import { buildProgram } from "../test-helpers/factories";
import { Program } from "../domain/Program";
import { SearchResultsPage } from "./SearchResultsPage";
import { navigate } from "@reach/router";

jest.mock("@reach/router", () => ({
  navigate: jest.fn(),
}));

describe("<SearchResultsPage />", () => {
  let stubClient: StubClient;

  beforeEach(() => {
    stubClient = new StubClient();
  });

  it("uses the url paramater in the search bar input", () => {
    const subject = render(<SearchResultsPage client={stubClient} searchQuery={"octopods"} />);
    expect(subject.getByPlaceholderText("Search for training courses")).toHaveValue("octopods");
  });

  it("uses the url parameter to execute a search", () => {
    render(<SearchResultsPage client={stubClient} searchQuery="octopods" />);
    expect(stubClient.capturedQuery).toEqual("octopods");
  });

  it("executes an empty search when parameter does not exist", () => {
    render(<SearchResultsPage client={stubClient} searchQuery={undefined} />);
    expect(stubClient.capturedQuery).toEqual("");
  });

  it("displays list of program names and their data", () => {
    const subject = render(<SearchResultsPage client={stubClient} />);

    const program1 = buildProgram({
      name: "program1",
      totalCost: 1000,
      percentEmployed: 0.6018342,
    });
    const program2 = buildProgram({
      name: "program2",
      totalCost: 333.33,
      percentEmployed: 0.8,
    });
    act(() => stubClient.capturedObserver.onSuccess([program1, program2]));

    expect(subject.getByText("program1", { exact: false })).toBeInTheDocument();
    expect(subject.getByText("$1,000.00", { exact: false })).toBeInTheDocument();
    expect(subject.getByText("60.1%", { exact: false })).toBeInTheDocument();

    expect(subject.getByText("program2", { exact: false })).toBeInTheDocument();
    expect(subject.getByText("$333.33", { exact: false })).toBeInTheDocument();
    expect(subject.getByText("80.0%", { exact: false })).toBeInTheDocument();
  });

  it("displays percent employed as '--' when it is null", () => {
    const subject = render(<SearchResultsPage client={stubClient} />);

    act(() => stubClient.capturedObserver.onSuccess([buildProgram({ percentEmployed: null })]));

    expect(subject.getByText("--", { exact: false })).toBeInTheDocument();
  });

  it("navigates to new search page when new search is executed", () => {
    const subject = render(<SearchResultsPage client={stubClient} />);
    fireEvent.change(subject.getByPlaceholderText("Search for training courses"), {
      target: { value: "penguins" },
    });
    fireEvent.click(subject.getByText("Search"));
    expect(navigate).toHaveBeenCalledWith("/search/penguins");
  });
});

class StubClient implements Client {
  capturedObserver: Observer<Program[]> = {
    onError: () => {},
    onSuccess: () => {},
  };

  capturedQuery: string | undefined = undefined;

  getProgramsByQuery(query: string, observer: Observer<Program[]>): void {
    this.capturedObserver = observer;
    this.capturedQuery = query;
  }
}
