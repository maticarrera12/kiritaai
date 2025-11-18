"use client";

import { scaleLinear } from "d3-scale";
import { motion, AnimatePresence } from "framer-motion";
import { FC, useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { feature } from "topojson-client";

// ISO2 → ISO numeric (UN M49)
const ISO2_TO_ISONUM: Record<string, string> = {
  AR: "032",
  US: "840",
  BR: "076",
  MX: "484",
  ES: "724",
  FR: "250",
  DE: "276",
  CL: "152",
};

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface TooltipData {
  country: string;
  count: number;
  x: number;
  y: number;
}

interface WorldUserMapProps {
  data?: Record<string, number>;
}

const WorldUserMap: FC<WorldUserMapProps> = ({ data }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [geoFeatures, setGeoFeatures] = useState<any[]>([]);

  const internalData = data || {
    AR: 142,
    US: 320,
    BR: 80,
    ES: 40,
    MX: 60,
    FR: 22,
    DE: 19,
    CL: 10,
  };

  const dataIsoNum: Record<string, number> = {};
  Object.entries(internalData).forEach(([iso2, count]) => {
    const isoNum = ISO2_TO_ISONUM[iso2];
    if (isoNum) dataIsoNum[isoNum] = count;
  });

  const maxUsers = Math.max(...Object.values(dataIsoNum));

  const colorScale = scaleLinear<string>().domain([0, maxUsers]).range(["#e9e9e9", "#4f46e5"]); // gris → violeta fuerte

  useEffect(() => {
    fetch(geoUrl)
      .then((res) => res.json())
      .then((worldData) => {
        const features = feature(worldData, worldData.objects.countries).features;

        setGeoFeatures(features);
      });
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Users by Country</h2>

      {/* Mapa más pequeño */}
      <div className="w-full max-w-3xl">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 80 }} // más pequeño
          width={600}
          height={300}
        >
          <Geographies geography={geoFeatures}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isoNum = geo.id as string;
                const count = dataIsoNum[isoNum] ?? 0;

                return (
                  <motion.g
                    key={geo.rsmKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Geography
                      geography={geo}
                      fill={colorScale(count)}
                      style={{
                        default: { outline: "none", transition: "all 0.2s ease" },
                        hover: { fill: "#6d5bff", outline: "none" },
                      }}
                      onMouseEnter={(event) => {
                        const bounds = event.currentTarget.getBoundingClientRect();
                        setTooltip({
                          country: geo.properties.name,
                          count,
                          x: bounds.left + bounds.width / 2,
                          y: bounds.top,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  </motion.g>
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            className="pointer-events-none fixed z-50 px-3 py-2 rounded-lg text-sm font-medium
                       bg-black/80 text-white dark:bg-white/90 dark:text-black shadow-md"
            style={{
              left: tooltip.x,
              top: tooltip.y - 10,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div>{tooltip.country}</div>
            <div className="opacity-80 text-xs">{tooltip.count} users</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorldUserMap;
