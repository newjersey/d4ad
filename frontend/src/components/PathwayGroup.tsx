import { CAREER_PATHWAY_QUERY } from "../queries/careerPathway";
import { PathwayGroupProps, SelectProps, SinglePathwayProps } from "../types/contentful";
import { useContentfulClient } from "../utils/useContentfulClient";
import { useEffect } from "react";
import { groupObjectsByLevel } from "../utils/groupObjectsByLevel";

export const PathwayGroup = (props: {
  sys: {
    id: string;
  };
  activeGroup?: boolean;
  active?: boolean;
  setSelected: (id: SelectProps) => void;
  selected?: SelectProps;
  setOpen: (open: boolean) => void;
  setPaths: (paths: { mapId: string; listTitle: string; items: SinglePathwayProps[] }) => void;
  title: string;
  icon: string;
}) => {
  const data: {
    careerMap: PathwayGroupProps;
  } = useContentfulClient({
    query: CAREER_PATHWAY_QUERY,
    variables: { id: props.sys.id },
  });

  const fullMap = () => {
    if (data?.careerMap.pathways) {
      const pathways = data.careerMap.pathways.items.map((path) => ({
        title: path.title,
        collection: path.occupationsCollection,
        groups: groupObjectsByLevel(path.occupationsCollection.items),
      }));

      localStorage.setItem("fullMap", JSON.stringify(pathways));
    }
  };
  useEffect(() => {
    if (data && props.activeGroup) {
      fullMap();
    }
  }, [data, props.activeGroup]);

  return (
    <>
      {data && (
        <div className="usa-radio">
          <input
            className="usa-radio__input"
            id={`${data.careerMap.title}-${data.careerMap.sys.id}`}
            type="radio"
            name={`${props.icon}-pathways`}
            defaultChecked={props.active}
            onChange={(e) => {
              props.setPaths({
                mapId: data.careerMap.sys.id,
                listTitle: data.careerMap.title,
                items: data.careerMap.pathways ? data.careerMap.pathways?.items || [] : [],
              });
              localStorage.setItem(
                "pathItems",
                JSON.stringify({
                  mapId: data.careerMap.sys.id,
                  items: data.careerMap.pathways ? data.careerMap.pathways?.items || [] : [],
                }),
              );
            }}
          />

          <label
            className="usa-radio__label"
            htmlFor={`${data.careerMap.title}-${data.careerMap.sys.id}`}
          >
            {data.careerMap.title}
          </label>
        </div>
      )}
    </>
  );
};
