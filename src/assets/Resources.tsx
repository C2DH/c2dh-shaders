import resourcesData from "./data/resources.json";

const Resources = () => {
  return (
    <>
      <p>Websites</p>
      <ul className="Functions flex flex-col flex-wrap">
        {resourcesData.resources.websites.map((func) => (
          <li key={func.name}>
            <a href={func.link} target="_blank">
              {func.name}
            </a>
            {resourcesData.resources.websites.indexOf(func) !==
              resourcesData.resources.websites.length - 1 && ","}
          </li>
        ))}
      </ul>
      <p>GLSL Graphs</p>
      <ul className="Functions flex flex-col flex-wrap">
        {resourcesData.resources.graphs.map((func) => (
          <li key={func.name}>
            <a href={func.link} target="_blank">
              {func.name}
            </a>
            {resourcesData.resources.graphs.indexOf(func) !==
              resourcesData.resources.graphs.length - 1 && ","}
          </li>
        ))}
      </ul>
      <p>Noise Generators</p>
      <ul className="Functions flex flex-col flex-wrap">
        {resourcesData.resources.noises.map((func) => (
          <li key={func.name}>
            <a href={func.link} target="_blank">
              {func.name}
            </a>
            {resourcesData.resources.noises.indexOf(func) !==
              resourcesData.resources.noises.length - 1 && ","}
          </li>
        ))}
      </ul>
    </>
  );
};

export default Resources;
