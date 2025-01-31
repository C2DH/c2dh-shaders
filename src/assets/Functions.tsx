import functionsData from "./data/functions.json";

const Functions = () => {
  return (
    <>
      <ul className="Functions flex flex-wrap">
        {functionsData.functions.useful.map((func) => (
          <li key={func.name}>
            <a href={func.link} target="_blank">
              {func.name}()
            </a>
            {functionsData.functions.useful.indexOf(func) !==
              functionsData.functions.useful.length - 1 && ","}
          </li>
        ))}
      </ul>
      <p>The most popular Noises</p>
      <ul className="Functions flex flex-wrap">
        {functionsData.functions.noises.map((func) => (
          <li key={func.name}>
            <a href={func.link} target="_blank">
              {func.name}()
            </a>
            {functionsData.functions.noises.indexOf(func) !==
              functionsData.functions.noises.length - 1 && ","}
          </li>
        ))}
      </ul>
    </>
  );
};

export default Functions;
