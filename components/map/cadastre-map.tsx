import L from "leaflet";
import "leaflet.vectorgrid";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

const CadastreVectorTiles = () => {
  const map = useMap();

  useEffect(() => {
    const cadastreVectorGrid = L.vectorGrid.protobuf(
      "https://openmaptiles.data.gouv.fr/data/cadastre-dvf/{z}/{x}/{y}.pbf",
      {
        attribution: '&copy; <a href="https://www.cadastre.gouv.fr/">DGFiP</a>',
        maxZoom: 20,
        minZoom: 16,
        maxNativeZoom: 16,
        minNativeZoom: 16,
        interactive: true,
        getFeatureId: (f) => f.id?.toString() || "",
      }
    );
    cadastreVectorGrid.addTo(map);

    const decoupageVectorGrid = L.vectorGrid.protobuf(
      "https://openmaptiles.data.gouv.fr/data/decoupage-administratif-2024/{z}/{x}/{y}.pbf",
      {
        minZoom: 3,
        maxZoom: 12,
        maxNativeZoom: 16,
        attribution: "© DINUM (data.gouv.fr)",
      }
    );
    decoupageVectorGrid.addTo(map);

    return () => {
      map.removeLayer(cadastreVectorGrid);
      map.removeLayer(decoupageVectorGrid);
    };
  }, [map]);

  return null;
};

export default CadastreVectorTiles;
