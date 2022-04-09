const reportResults = require("./reportResults");
const {
  WEB_VITALS_ACCESSOR_KEY,
  WEB_VITALS_KEYS,
  LOG_SLUG,
} = require("./constants");

const mockThresholds = {
  [WEB_VITALS_KEYS[0]]: 5,
  [WEB_VITALS_KEYS[1]]: 5,
  [WEB_VITALS_KEYS[2]]: 5,
};

const mockOnReport = jest.fn();

describe("reportResults", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.cy = {
      window: jest.fn(),
      log: jest.fn(),
    };
  });

  describe("when all metrics are below the thresholds", () => {
    const mockWindow = {
      [WEB_VITALS_ACCESSOR_KEY]: {
        [WEB_VITALS_KEYS[0]]: { value: 1 },
        [WEB_VITALS_KEYS[1]]: { value: 2 },
        [WEB_VITALS_KEYS[2]]: { value: 3 },
      },
    };

    beforeEach(async () => {
      global.cy.window.mockResolvedValue(mockWindow);

      await reportResults({
        thresholds: mockThresholds,
        onReport: mockOnReport,
      })();
    });

    it("should log the results", () => {
      expect(global.cy.log).toHaveBeenCalledWith(
        `-------- ${LOG_SLUG} --------`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `lcp web-vital is 1, and threshold was 5.`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `fid web-vital is 2, and threshold was 5.`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `cls web-vital is 3, and threshold was 5.`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        "-----------------------------"
      );
    });

    it("should pass the report to the callback", () => {
      expect(mockOnReport).toHaveBeenCalledWith({
        thresholds: mockThresholds,
        results: {
          lcp: 1,
          fid: 2,
          cls: 3,
          fcp: null,
          ttfb: null,
        },
      });
    });
  });

  describe("when one metric is over it's threshold", () => {
    let error;

    const mockWindow = {
      [WEB_VITALS_ACCESSOR_KEY]: {
        [WEB_VITALS_KEYS[0]]: { value: 1 },
        [WEB_VITALS_KEYS[1]]: { value: 10 },
        [WEB_VITALS_KEYS[2]]: { value: 5 },
      },
    };

    beforeEach(async () => {
      global.cy.window.mockResolvedValue(mockWindow);
      error = undefined;

      try {
        await reportResults({
          thresholds: mockThresholds,
          onReport: mockOnReport,
        })();
      } catch (e) {
        error = e;
      }
    });

    it("should log the results", () => {
      expect(global.cy.log).toHaveBeenCalledWith(
        `-------- ${LOG_SLUG} --------`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `lcp web-vital is 1, and threshold was 5.`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `cls web-vital is 5, and threshold was 5.`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        "-----------------------------"
      );
    });

    it("should pass the report to the callback", () => {
      expect(mockOnReport).toHaveBeenCalledWith({
        thresholds: mockThresholds,
        results: {
          lcp: 1,
          fid: 10,
          cls: 5,
          fcp: null,
          ttfb: null,
        },
      });
    });

    it("throw an error", () => {
      expect(error.message).toEqual(
        "cy.vitals() - A threshold has been crossed.\n\nfid web-vital is 10, and is over the 5 threshold."
      );
    });
  });

  describe("when one metric cannot be calculated", () => {
    const mockWindow = {
      [WEB_VITALS_ACCESSOR_KEY]: {
        [WEB_VITALS_KEYS[0]]: { value: 1 },
        [WEB_VITALS_KEYS[1]]: undefined,
        [WEB_VITALS_KEYS[2]]: { value: 0.1 },
      },
    };

    beforeEach(async () => {
      global.cy.window.mockResolvedValue(mockWindow);

      await reportResults({
        thresholds: mockThresholds,
        onReport: mockOnReport,
      })();
    });

    it("should log the results", () => {
      expect(global.cy.log).toHaveBeenCalledWith(
        `-------- ${LOG_SLUG} --------`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `lcp web-vital is 1, and threshold was 5.`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `fid web-vital could not be calculated, and threshold was 5. Skipping...`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `cls web-vital is 0.1, and threshold was 5.`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        "-----------------------------"
      );
    });

    it("should pass the report to the callback", () => {
      expect(mockOnReport).toHaveBeenCalledWith({
        thresholds: mockThresholds,
        results: {
          lcp: 1,
          fid: null,
          cls: 0.1,
          fcp: null,
          ttfb: null,
        },
      });
    });
  });

  describe("when all metrics are over their threshold", () => {
    let error;

    const mockWindow = {
      [WEB_VITALS_ACCESSOR_KEY]: {
        [WEB_VITALS_KEYS[0]]: { value: 5.1 },
        [WEB_VITALS_KEYS[1]]: { value: 11 },
        [WEB_VITALS_KEYS[2]]: { value: 12 },
      },
    };

    beforeEach(async () => {
      global.cy.window.mockResolvedValue(mockWindow);
      error = undefined;

      try {
        await reportResults({
          thresholds: mockThresholds,
          onReport: mockOnReport,
        })();
      } catch (e) {
        error = e;
      }
    });

    it("should log the results", () => {
      expect(global.cy.log).toHaveBeenCalledWith(
        `-------- ${LOG_SLUG} --------`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `lcp web-vital is 5.1, and is over the 5 threshold.`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `fid web-vital is 11, and is over the 5 threshold.`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `cls web-vital is 12, and is over the 5 threshold.`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        "-----------------------------"
      );
    });

    it("should pass the report to the callback", () => {
      expect(mockOnReport).toHaveBeenCalledWith({
        thresholds: mockThresholds,
        results: {
          lcp: 5.1,
          fid: 11,
          cls: 12,
          fcp: null,
          ttfb: null,
        },
      });
    });

    it("throw an error", () => {
      expect(error.message).toEqual(
        "cy.vitals() - Some thresholds have been crossed.\n\nlcp web-vital is 5.1, and is over the 5 threshold.\nfid web-vital is 11, and is over the 5 threshold.\ncls web-vital is 12, and is over the 5 threshold."
      );
    });
  });

  describe("when no thresholds are provided", () => {
    const mockWindow = {
      [WEB_VITALS_ACCESSOR_KEY]: {
        [WEB_VITALS_KEYS[0]]: { value: 1 },
        [WEB_VITALS_KEYS[1]]: { value: 2 },
        [WEB_VITALS_KEYS[2]]: { value: 3 },
      },
    };

    beforeEach(async () => {
      global.cy.window.mockResolvedValue(mockWindow);

      await reportResults({
        thresholds: {},
        onReport: mockOnReport,
      })();
    });

    it("should not log any results (as there are none!)", () => {
      expect(global.cy.log).not.toHaveBeenCalled();
    });

    it("should pass the report to the callback", () => {
      expect(mockOnReport).toHaveBeenCalledWith({
        thresholds: {},
        results: {
          lcp: 1,
          fid: 2,
          cls: 3,
          fcp: null,
          ttfb: null,
        },
      });
    });
  });

  describe("when no custom report callback is provided", () => {
    const mockWindow = {
      [WEB_VITALS_ACCESSOR_KEY]: {
        [WEB_VITALS_KEYS[0]]: { value: 1 },
        [WEB_VITALS_KEYS[1]]: { value: 2 },
        [WEB_VITALS_KEYS[2]]: { value: 3 },
      },
    };

    beforeEach(async () => {
      global.cy.window.mockResolvedValue(mockWindow);

      await reportResults({
        thresholds: mockThresholds,
        onReport: undefined,
      })();
    });

    it("should log the results", () => {
      expect(global.cy.log).toHaveBeenCalledWith(
        `-------- ${LOG_SLUG} --------`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `lcp web-vital is 1, and threshold was 5.`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `fid web-vital is 2, and threshold was 5.`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        `cls web-vital is 3, and threshold was 5.`
      );
      expect(global.cy.log).toHaveBeenCalledWith(
        "-----------------------------"
      );
    });
  });
});
