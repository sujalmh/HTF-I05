export default {
  gdp: {
    india: {
      annual: [
        { year: 2020, value: 2.66, growth_rate: -7.3 },
        { year: 2021, value: 2.89, growth_rate: 8.7 },
        { year: 2022, value: 3.1, growth_rate: 7.2 },
        { year: 2023, value: 3.29, growth_rate: 6.1 },
        { year: 2024, value: 3.51, growth_rate: 6.8 },
      ],
      quarterly: [
        { year: 2023, quarter: "Q1", value: 3.18, growth_rate: 6.1 },
        { year: 2023, quarter: "Q2", value: 3.24, growth_rate: 7.8 },
        { year: 2023, quarter: "Q3", value: 3.32, growth_rate: 5.9 },
        { year: 2023, quarter: "Q4", value: 3.41, growth_rate: 4.6 },
        { year: 2024, quarter: "Q1", value: 3.47, growth_rate: 7.2 },
        { year: 2024, quarter: "Q2", value: 3.54, growth_rate: 6.5 },
      ],
    },
    china: {
      annual: [
        { year: 2020, value: 14.72, growth_rate: 2.2 },
        { year: 2021, value: 16.94, growth_rate: 8.1 },
        { year: 2022, value: 17.96, growth_rate: 3.0 },
        { year: 2023, value: 19.37, growth_rate: 5.2 },
        { year: 2024, value: 20.53, growth_rate: 5.0 },
      ],
    },
    us: {
      annual: [
        { year: 2020, value: 20.89, growth_rate: -3.5 },
        { year: 2021, value: 22.99, growth_rate: 5.7 },
        { year: 2022, value: 25.46, growth_rate: 2.1 },
        { year: 2023, value: 26.85, growth_rate: 2.5 },
        { year: 2024, value: 27.92, growth_rate: 2.1 },
      ],
    },
  },
  cpi: {
    india: {
      annual: [
        { year: 2020, value: 159.1, growth_rate: 6.2 },
        { year: 2021, value: 167.2, growth_rate: 5.1 },
        { year: 2022, value: 178.4, growth_rate: 6.7 },
        { year: 2023, value: 188.2, growth_rate: 5.5 },
        { year: 2024, value: 197.2, growth_rate: 4.8 },
      ],
    },
  },
  sectors: {
    india: {
      2023: [
        { sector: "Services", contribution: 54.3 },
        { sector: "Industry", contribution: 25.8 },
        { sector: "Agriculture", contribution: 19.9 },
      ],
    },
  },
}

