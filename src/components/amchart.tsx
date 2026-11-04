import { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import { useAppSelector, getPriceBySymbol } from "@/store/index";

interface AmChartProps {
  symbol: string;
}

interface ChartDataPoint {
  date: number;
  value: number;
}

export default function AmChart({ symbol }: AmChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const seriesRef = useRef<am5xy.LineSeries | null>(null);
  const yAxisRef = useRef<am5xy.ValueAxis<am5xy.AxisRenderer> | null>(null);
  const rangeItemRef = useRef<am5.DataItem<am5xy.IValueAxisDataItem> | null>(null);

  // Get live price feed for the selected symbol from Redux
  const livePriceData = useAppSelector((state) => getPriceBySymbol(state, symbol));

  // Keep a ref to the latest live price so initial chart mount doesn't re-trigger on every tick
  const livePriceDataRef = useRef(livePriceData);

  useEffect(() => {
    livePriceDataRef.current = livePriceData;
  }, [livePriceData]);

  // Initialize and configure amCharts 5 when symbol changes
  useEffect(() => {
    if (!chartRef.current) return;

    // Clean up any existing root
    if (rootRef.current) {
      rootRef.current.dispose();
      rootRef.current = null;
    }

    const currentLive = livePriceDataRef.current;
    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    // Remove amCharts branding watermark container if allowed
    if (root._logo) {
      root._logo.dispose();
    }

    // Apply dark, animated, and responsive themes
    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Dark.new(root),
      am5themes_Responsive.new(root),
    ]);

    // Create chart
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 0,
      })
    );

    // Subtle dark chart background
    chart.plotContainer.set(
      "background",
      am5.Rectangle.new(root, {
        fill: am5.color(0x131519),
        fillOpacity: 0.6,
      })
    );

    // Crosshair cursor
    const cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
      })
    );
    cursor.lineY.set("visible", true);
    cursor.lineY.set("stroke", am5.color(0x3ddc84));
    cursor.lineY.set("strokeDasharray", [3, 3]);
    cursor.lineX.set("strokeDasharray", [3, 3]);

    // Date (X) Axis
    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 60,
      minorGridEnabled: true,
    });
    xRenderer.grid.template.setAll({
      stroke: am5.color(0x2a2c31),
      strokeDasharray: [2, 4],
    });
    xRenderer.labels.template.setAll({
      fill: am5.color(0x8d9097),
      fontSize: 11,
    });

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0.2,
        baseInterval: { timeUnit: "second", count: 1 },
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    // Value / Price (Y) Axis
    const yRenderer = am5xy.AxisRendererY.new(root, {
      pan: "zoom",
      opposite: true,
    });
    yRenderer.grid.template.setAll({
      stroke: am5.color(0x2a2c31),
      strokeDasharray: [2, 4],
    });
    yRenderer.labels.template.setAll({
      fill: am5.color(0x8d9097),
      fontSize: 11,
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        autoZoom: true,
        renderer: yRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    yAxisRef.current = yAxis;

    // Create Line Series
    const isPositive =
      currentLive?.change24h ? parseFloat(currentLive.change24h) >= 0 : true;
    const themeColor = isPositive ? am5.color(0x3ddc84) : am5.color(0xd8454f);

    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: symbol,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        stroke: themeColor,
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY}",
        }),
      })
    );

    series.strokes.template.setAll({
      strokeWidth: 2,
    });

    // Glowing translucent area gradient under the curve
    series.fills.template.setAll({
      fillOpacity: 0.15,
      visible: true,
      fill: themeColor,
    });

    // Bullet at the latest point
    series.bullets.push(() => {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 3.5,
          fill: themeColor,
        }),
      });
    });

    // Seed realistic initial data points around the current price
    const currentPrice = currentLive?.price
      ? parseFloat(currentLive.price)
      : symbol.includes("BTC")
      ? 76500
      : symbol.includes("ETH")
      ? 2600
      : symbol.includes("SOL")
      ? 180
      : 100;

    const initialData: ChartDataPoint[] = [];
    const count = 40;
    const now = Date.now();
    let prevVal = currentPrice;

    for (let i = count; i >= 0; i--) {
      const pointTime = now - i * 3000; // 3-second intervals
      const variation = (Math.random() - 0.5) * (currentPrice * 0.001);
      prevVal = Math.max(0.0001, prevVal + variation);
      if (i === 0) prevVal = currentPrice;
      initialData.push({
        date: pointTime,
        value: parseFloat(prevVal.toFixed(prevVal < 1 ? 5 : 2)),
      });
    }

    series.data.setAll(initialData);

    // Create current price line range on Y-axis
    const rangeDataItem = yAxis.createAxisRange(
      yAxis.makeDataItem({
        value: currentPrice,
      })
    );
    rangeItemRef.current = rangeDataItem;

    const rangeGrid = rangeDataItem.get("grid");
    if (rangeGrid) {
      rangeGrid.setAll({
        stroke: themeColor,
        strokeOpacity: 0.7,
        strokeDasharray: [3, 3],
      });
    }

    const rangeLabel = rangeDataItem.get("label");
    if (rangeLabel) {
      rangeLabel.setAll({
        text: currentPrice.toFixed(currentPrice < 1 ? 5 : 2),
        fill: am5.color(0xffffff),
        background: am5.Rectangle.new(root, {
          fill: themeColor,
        }),
      });
    }

    seriesRef.current = series;

    // Animate in
    series.appear(600);
    chart.appear(600, 100);

    return () => {
      root.dispose();
      rootRef.current = null;
      seriesRef.current = null;
      yAxisRef.current = null;
      rangeItemRef.current = null;
    };
  }, [symbol]);

  // Update chart when live price feed updates from WebSocket
  useEffect(() => {
    if (!seriesRef.current || !livePriceData?.price) return;

    const newPrice = parseFloat(livePriceData.price);
    if (isNaN(newPrice)) return;

    const series = seriesRef.current;
    const now = livePriceData.lastUpdated || Date.now();

    // Append the new live price point
    series.data.push({
      date: now,
      value: newPrice,
    });

    // Maintain recent data window (up to 80 points)
    if (series.data.length > 80) {
      series.data.removeIndex(0);
    }

    // Update the live price line range on the Y axis
    if (rangeItemRef.current) {
      rangeItemRef.current.set("value", newPrice);
      const label = rangeItemRef.current.get("label");
      if (label) {
        label.set("text", newPrice.toFixed(newPrice < 1 ? 5 : 2));
      }
    }
  }, [livePriceData?.price, livePriceData?.lastUpdated]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "360px",
        position: "relative",
      }}
    >
      <div
        id="chartdiv"
        ref={chartRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "360px",
        }}
      />
    </div>
  );
}
