import React from "react";

const testElement = <div data-testid="compound-stop-marker-mock" />;

export default jest.fn().mockReturnValue(testElement);
