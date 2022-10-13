import React from "react";
import { render } from "@testing-library/react";

import { HosqUploadFiles } from "./Hosq";

describe("Wallet", () => {
  test("renders the Wallet component", () => {
    render(<HosqUploadFiles />);
  });
});