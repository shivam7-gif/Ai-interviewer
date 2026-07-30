import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Terminal,
  FileOutput,
  FlaskConical,
} from "lucide-react";
import type { TestTabId, TestResult } from "../types";

const MOCK_RESULTS: TestResult[] = [
  {
    passed: true,
    input: "3\n4 3\n1 2\n2 3\n3 4",
    expected: "1 2 3 4",
    got: "1 2 3 4",
    time: "2ms",
    memory: "8.2MB",
  },
  {
    passed: false,
    input: "3 2\n1 2\n2 3\n3 1",
    expected: "-1",
    got: "1 2 3",
    time: "1ms",
    memory: "7.8MB",
  },
  {
    passed: true,
    input: "5 5\n1 2\n2 3\n3 4\n4 5\n5 1",
    expected: "1 2 3 4 5",
    got: "1 2 3 4 5",
    time: "3ms",
    memory: "9.1MB",
  },
];

interface TestResultsProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const TAB_ICONS: Record<TestTabId, React.ElementType> = {
  "Test Results": FlaskConical,
  Console: Terminal,
  Output: FileOutput,
};

export const TestResults: React.FC<TestResultsProps> = ({
  collapsed = false,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<TestTabId>("Test Results");
  const [selectedCase, setSelectedCase] = useState(0);

  const passCount = MOCK_RESULTS.filter((r) => r.passed).length;
  const totalCount = MOCK_RESULTS.length;
  const allPassed = passCount === totalCount;
  const result = MOCK_RESULTS[selectedCase];

  return (
    <div className="test-results-panel">
      {/* Tab bar + toggle */}
      <div className="test-tab-bar">
        <div className="test-tabs">
          {(["Test Results", "Console", "Output"] as TestTabId[]).map((tab) => {
            const Icon = TAB_ICONS[tab];
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`test-tab ${active ? "test-tab-active" : ""}`}
              >
                <Icon size={13} />
                {tab}
                {tab === "Test Results" && (
                  <span
                    className={`test-count-badge ${allPassed ? "test-count-pass" : "test-count-fail"}`}
                  >
                    {passCount}/{totalCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button className="test-collapse-btn" onClick={onToggle}>
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{collapsed ? "Expand" : "Collapse"}</span>
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="test-results-body">
          {activeTab === "Test Results" && (
            <div className="test-results-content">
              {/* Summary */}
              <div className="test-summary">
                {allPassed ? (
                  <div className="test-summary-pass">
                    <CheckCircle size={16} />
                    <span>All test cases passed</span>
                  </div>
                ) : (
                  <div className="test-summary-fail">
                    <XCircle size={16} />
                    <span>{totalCount - passCount} test case(s) failed</span>
                  </div>
                )}
                <div className="test-perf">
                  <Clock size={12} />
                  <span>2ms</span>
                  <Cpu size={12} style={{ marginLeft: 8 }} />
                  <span>8.4MB</span>
                </div>
              </div>

              {/* Case selector */}
              <div className="test-case-selector">
                {MOCK_RESULTS.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCase(i)}
                    className={`test-case-btn ${selectedCase === i ? "test-case-btn-active" : ""}`}
                  >
                    {r.passed ? (
                      <CheckCircle size={12} className="test-case-pass-icon" />
                    ) : (
                      <XCircle size={12} className="test-case-fail-icon" />
                    )}
                    Case {i + 1}
                  </button>
                ))}
              </div>

              {/* Case details */}
              <div className="test-case-detail">
                <TestBlock label="Input" value={result.input} />
                <TestBlock label="Expected Output" value={result.expected} />
                <TestBlock
                  label="Your Output"
                  value={result.got}
                  highlight={!result.passed}
                />
              </div>
            </div>
          )}

          {activeTab === "Console" && (
            <div className="test-console">
              <div className="console-line console-info">[INFO] Compiling solution...</div>
              <div className="console-line console-success">[OK] Compilation successful.</div>
              <div className="console-line console-info">[INFO] Running test cases...</div>
              <div className="console-line console-success">[PASS] Test 1: 2ms / 8.2MB</div>
              <div className="console-line console-danger">[FAIL] Test 2: Expected -1, got 1 2 3</div>
              <div className="console-line console-success">[PASS] Test 3: 3ms / 9.1MB</div>
              <div className="console-line console-dim">―――――――――――――――――――――</div>
              <div className="console-line console-warning">2/3 test cases passed.</div>
            </div>
          )}

          {activeTab === "Output" && (
            <div className="test-console">
              <div className="console-line console-dim">1 2 3 4</div>
              <div className="console-line console-dim">1 2 3</div>
              <div className="console-line console-dim">1 2 3 4 5</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TestBlock: React.FC<{
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ label, value, highlight }) => (
  <div style={{ marginBottom: 10 }}>
    <div className="test-block-label">{label}</div>
    <pre
      className={`test-block-code ${highlight ? "test-block-code-fail" : ""}`}
    >
      {value}
    </pre>
  </div>
);
