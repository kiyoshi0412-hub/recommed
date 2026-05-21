import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import path from "path";

Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/NotoSansJP-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(process.cwd(), "public/fonts/NotoSansJP-Bold.ttf"), fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 10,
    padding: 40,
    backgroundColor: "#ffffff",
    color: "#333333",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  headerLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 4,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  badge: {
    fontSize: 8,
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  description: {
    fontSize: 9,
    color: "#4b5563",
    marginTop: 6,
    lineHeight: 1.6,
  },
  outputDate: {
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "right",
    marginTop: 4,
  },
  section: {
    marginBottom: 14,
  },
  categoryHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 6,
  },
  appealItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 10,
    color: "#2563eb",
    marginRight: 6,
    marginTop: 1,
  },
  appealContent: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.7,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#9ca3af",
  },
});

type Appeal = { id: number; category: string; content: string; priority: number };
type Props = {
  company: {
    name: string;
    industry?: string | null;
    description?: string | null;
    appealPoints: Appeal[];
  };
  outputDate: string;
};

const CATEGORY_ORDER = ["給与・待遇", "職場環境", "待遇", "キャリア", "その他"];

export default function CompanyPDF({ company, outputDate }: Props) {
  const grouped: Record<string, Appeal[]> = {};
  CATEGORY_ORDER.forEach((cat) => {
    const points = company.appealPoints.filter((p) => p.category === cat);
    if (points.length > 0) grouped[cat] = points;
  });
  company.appealPoints.forEach((p) => {
    if (!CATEGORY_ORDER.includes(p.category) && !grouped[p.category]) {
      grouped[p.category] = company.appealPoints.filter((a) => a.category === p.category);
    }
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>企業訴求ポイント資料</Text>
          <Text style={styles.companyName}>{company.name}</Text>
          <View style={styles.badgeRow}>
            {company.industry && <Text style={styles.badge}>{company.industry}</Text>}
          </View>
          {company.description && (
            <Text style={styles.description}>{company.description}</Text>
          )}
          <Text style={styles.outputDate}>出力日: {outputDate}</Text>
        </View>

        {/* 訴求ポイント */}
        {Object.entries(grouped).map(([category, points]) => (
          <View key={category} style={styles.section}>
            <Text style={styles.categoryHeader}>{category}</Text>
            {points.map((point) => (
              <View key={point.id} style={styles.appealItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.appealContent}>{point.content}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* フッター */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>本資料は社内利用限定です。外部への無断配布はご遠慮ください。</Text>
          <Text style={styles.footerText}>{company.name}</Text>
        </View>
      </Page>
    </Document>
  );
}
