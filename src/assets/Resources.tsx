import resourcesData from "./data/resources.json";

const Resources = () => {
  return (
    <>
      <p>Websites</p>
      <ul className="Functions flex flex-col flex-wrap">
        {resourcesData.resources.websites.map((func) => (
          <li key={func.name}>
            <a href={func.link} target="_blank" rel="noopener noreferrer">
              {func.name}
            </a>
            {resourcesData.resources.websites.indexOf(func) !==
              resourcesData.resources.websites.length - 1 && ","}
          </li>
        ))}
      </ul>
      <p>Inspiration</p>
      <ul className="Functions flex flex-col flex-wrap">
        {resourcesData.resources.inspiration.map((func) => (
          <li key={func.name}>
            <a href={func.link} target="_blank" rel="noopener noreferrer">
              {func.name}
            </a>
            {resourcesData.resources.inspiration.indexOf(func) !==
              resourcesData.resources.inspiration.length - 1 && ","}
          </li>
        ))}
      </ul>
      <p>YouTube</p>
      <ul className="Functions flex flex-col flex-wrap">
        {resourcesData.resources.youtube.map((func) => (
          <li key={func.name}>
            <a href={func.link} target="_blank" rel="noopener noreferrer">
              {func.name}
            </a>
            {resourcesData.resources.youtube.indexOf(func) !==
              resourcesData.resources.youtube.length - 1 && ","}
          </li>
        ))}
      </ul>
      <p>Tutorials</p>
      <ul className="Functions flex flex-col flex-wrap">
        {resourcesData.resources.tutorials.map((func) => (
          <li key={func.name}>
            <a href={func.link} target="_blank" rel="noopener noreferrer">
              {func.name}
            </a>
            {func.code && (
              <a href={func.code} target="_blank" rel="noopener noreferrer">
                / Code
              </a>
            )}
            {resourcesData.resources.tutorials.indexOf(func) !==
              resourcesData.resources.tutorials.length - 1 && ","}
          </li>
        ))}
      </ul>
      <p>Sound Effects</p>
      <ul className="Functions flex flex-col flex-wrap">
        {resourcesData.resources.sound.map((func) => (
          <li key={func.name}>
            <a href={func.link} target="_blank" rel="noopener noreferrer">
              {func.name}
            </a>
            {func.code && (
              <a href={func.code} target="_blank" rel="noopener noreferrer">
                / Code
              </a>
            )}
            {resourcesData.resources.sound.indexOf(func) !==
              resourcesData.resources.sound.length - 1 && ","}
          </li>
        ))}
      </ul>
      <p>GLSL Graphs</p>
      <ul className="Functions flex flex-col flex-wrap">
        {resourcesData.resources.graphs.map((func) => (
          <li key={func.name}>
            <a href={func.link} target="_blank" rel="noopener noreferrer">
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
            <a href={func.link} target="_blank" rel="noopener noreferrer">
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
