
let path = "/";

describe("It visits each Navbar Tabs", () => {
  it("Main Navigation Test ", () => {
    cy.visit(path);
    cy.get("ul > li.no-sub").each((items) => {
      cy.wrap(items)
        .children("a")
        .invoke("attr", "href")
        .then((url) => {
          if (url.includes(path)) {
            cy.log("Visits: ", url);
            cy.visit(url);
          } else {
            cy.log("CORS: ", url);
          }
        });
    });
  });

  it("Sub Navigation Test ", () => {
    cy.visit(path);
    cy.get("li.has-sub").each((sub_menu) => {
      cy.wrap(sub_menu)
        .children("a")
        .invoke("attr", "href")
        .then((url) => {
          if (url.includes(path)) {
            cy.log("Visits: ", url);
            cy.visit(url);
          } else {
            cy.log("CORS: ", url);
          }
        });
    });
  });
});
