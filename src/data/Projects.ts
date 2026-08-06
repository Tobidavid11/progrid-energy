// Project image imports — adjust these paths to wherever your
// actual installation photos live (e.g. src/assets/projects/).
import project1a from "../assets/project-1a.jpeg";
import project1b from "../assets/project-1b.jpeg";
import project2a from "../assets/project-2a.jpeg";
import project2b from "../assets/project-2b.jpeg";
import project3a from "../assets/project-3a.jpeg";
import project3b from "../assets/project-3b.jpeg";
import project4a from "../assets/project-4a.jpeg";
import project4b from "../assets/project-4b.jpeg";

export interface Project {
  title: string;
  handle: string;
  description: string;
  image: string[];
}

export const PROJECTS: Project[] = [
  {
    title: "4.2kVA Hybrid Solar Power Installation",
    handle: "Ago-Iwoye, Ogun State, Nigeria",
    description:
      "Designed and installed a high-performance 4.2kVA hybrid solar energy system featuring a 7.5kWh lithium battery, 3.6kWp bifacial mono solar array, and complete AC/DC protection. The system delivers reliable backup power for residential appliances, including air conditioning, water heating, refrigeration, laundry equipment, entertainment systems, and kitchen appliances, with an estimated 6-hour backup at a 1kW load.",
    image: [project1a, project1b],
  },
  {
    title: "5kVA Hybrid Solar Power Installation",
    handle: "@Lekki,Lagos State.",
    description:
      "Designed and deployed a robust 5kVA hybrid solar power system featuring a 7.5kWh lithium battery, 3.6kWp bifacial mono solar array, and comprehensive AC/DC protection. Built to provide efficient, uninterrupted power for residential and light commercial applications, the system comfortably supports high-demand appliances such as air conditioners, water heaters, refrigerators, washing machines, entertainment systems, and kitchen equipment, delivering an estimated 6-hour backup at a 1kW load.",
    image: [project2a, project2b],
  },
  {
    title: "8kVA Solar Power Installation",
    handle: "Oyo State, Nigeria",
    description:
      "Designed and commissioned a dependable 8kVA solar power system equipped with a 10.5kWh tubular battery bank, 5.4kWp mono solar array, and comprehensive AC/DC protection. Built to provide reliable energy for residential and small commercial environments, the system efficiently powers 2HP air conditioning units, refrigeration, water heating, laundry appliances, entertainment systems, and other essential electrical loads, delivering an estimated 5-hour backup at a 1kW load.",
    image: [project4a, project4b],
  },
  {
    title: "11kVA Hybrid Solar Power Installation",
    handle: "@Port Harcourt, Rivers State, Nigeria",
    description:
      "Engineered and installed a high-capacity 11kVA hybrid solar energy system comprising a 30kWh lithium battery bank, 10.8kWp bifacial mono solar array, and complete AC/DC protection infrastructure. Designed for large residential and commercial energy demands, the system efficiently powers multiple air conditioning units (6–10HP), water heaters, refrigeration, laundry equipment, entertainment systems, and other high-load appliances while delivering an estimated 24-hour backup at a 1.2kW load.",
    image: [project3a, project3b],
  },
  {
    title: "8kVA Solar Power Installation",
    handle: "Oyo State, Nigeria",
    description:
      "Designed and commissioned a dependable 8kVA solar power system equipped with a 10.5kWh tubular battery bank, 5.4kWp mono solar array, and comprehensive AC/DC protection. Built to provide reliable energy for residential and small commercial environments, the system efficiently powers 2HP air conditioning units, refrigeration, water heating, laundry appliances, entertainment systems, and other essential electrical loads, delivering an estimated 5-hour backup at a 1kW load.",
    image: [project4a, project4b],
  },
  {
    title: "11kVA Hybrid Solar Power Installation",
    handle: "@Port Harcourt, Rivers State, Nigeria",
    description:
      "Engineered and installed a high-capacity 11kVA hybrid solar energy system comprising a 30kWh lithium battery bank, 10.8kWp bifacial mono solar array, and complete AC/DC protection infrastructure. Designed for large residential and commercial energy demands, the system efficiently powers multiple air conditioning units (6–10HP), water heaters, refrigeration, laundry equipment, entertainment systems, and other high-load appliances while delivering an estimated 24-hour backup at a 1.2kW load.",
    image: [project3a, project3b],
  },
];