import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
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
  hasRun?: boolean;
  running?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({
  hasRun = false,
  running = false,
  collapsed = false,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<TestTabId>("Test Results");
  const [selectedCase, setSelectedCase] = useState(0);

  const passCount = MOCK_RESULTS.filter((r) => r.passed).length;
  const totalCount = MOCK_RESULTS.length;
  const result = MOCK_RESULTS[selectedCase] ?? MOCK_RESULTS[0];

  return (
    <div className="test-results-panel">
      {/* Header with text tabs and amber underline on active tab */}
      <div className="test-tab-bar">
        <div className="test-tabs-group" role="tablist">
          {(["Test Results", "Console", "Output"] as TestTabId[]).map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab)}
                className={`text-tab-btn ${active ? "tab-active" : ""}`}
              >
                {tab}
                {active && <span className="tab-underline" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <button
          className="collapse-toggle-btn"
          onClick={onToggle}
          aria-label={collapsed ? "Expand test panel" : "Collapse test panel"}
          title={collapsed ? "Expand panel" : "Collapse panel"}
        >
          {collapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          <span className="collapse-text">{collapsed ? "Expand" : "Collapse"}</span>
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="test-body">
          {activeTab === "Test Results" && (
            <div className="test-content">
              {!hasRun ? (
                <div className="empty-results-msg">
                  {running ? "Executing test cases..." : "Run your code to see results."}
                </div>
              ) : (
                <>
                  {/* Summary line in mono */}
                  <div className="test-mono-summary">
                    {passCount} of {totalCount} passed - 2 ms - 8.4 MB
                  </div>

                  {/* Segmented case buttons with pass/fail dots */}
                  <div className="case-segmented-bar" role="tablist">
                    {MOCK_RESULTS.map((r, i) => (
                      <button
                        key={i}
                        role="tab"
                        aria-selected={selectedCase === i}
                        onClick={() => setSelectedCase(i)}
                        className={`case-segment-btn ${
                          selectedCase === i ? "case-selected" : ""
                        }`}
                      >
                        <span
                          className={`case-dot ${
                            r.passed ? "dot-pass" : "dot-fail"
                          }`}
                          aria-hidden="true"
                        />
                        <span>Case {i + 1}</span>
                      </button>
                    ))}
                  </div>

                  {/* Labeled mono blocks for Input, Expected, and Actual */}
                  {result && (
                    <div className="case-details-grid">
                      <TestBlock label="Input" value={result.input} />
                      <TestBlock label="Expected" value={result.expected} />
                      <TestBlock
                        label="Actual"
                        value={result.got}
                        mismatch={!result.passed}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "Console" && (
            <div className="test-mono-console">
              {!hasRun ? (
                <div className="empty-results-msg">No console logs yet.</div>
              ) : (
                <>
                  <div className="console-row">[build] compilation target: standard-x86_64</div>
                  <div className="console-row">[status] compilation completed without warnings</div>
                  <div className="console-row">[test 1] 4 nodes, 3 edges - 2 ms (passed)</div>
                  <div className="console-row fail-line">[test 2] cycle detected or invalid topo order - 1 ms (failed)</div>
                  <div className="console-row">[test 3] 5 nodes, 5 edges - 3 ms (passed)</div>
                </>
              )}
            </div>
          )}

          {activeTab === "Output" && (
            <div className="test-mono-console">
              {!hasRun ? (
                <div className="empty-results-msg">No program output yet.</div>
              ) : (
                <>
                  <div className="console-row">1 2 3 4</div>
                  <div className="console-row fail-line">1 2 3</div>
                  <div className="console-row">1 2 3 4 5</div>
                </>
              )}
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
  mismatch?: boolean;
}> = ({ label, value, mismatch = false }) => (
  <div className="test-block-wrapper">
    <div className="test-block-title">{label}</div>
    <pre className={`test-block-content ${mismatch ? "mismatch-fail" : ""}`}>
      {value}
    </pre>
  </div>
);
