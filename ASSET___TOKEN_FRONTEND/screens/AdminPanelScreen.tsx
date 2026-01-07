import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Shield, CheckCircle, XCircle, FileText, Activity, Eye } from 'lucide-react';

export const AdminPanelScreen: React.FC = () => {
  const [submissions, setSubmissions] = useState([
    {
      id: '1',
      assetName: 'Seattle Tech Hub',
      location: 'Seattle, WA, USA',
      type: 'real-estate',
      submittedBy: '0x1234...5678',
      submittedAt: '2026-01-05T10:30:00Z',
      status: 'pending',
      documents: {
        titleDeed: true,
        valuationReport: true,
        legalOpinion: false,
      },
    },
    {
      id: '2',
      assetName: 'Gold Bullion Reserve',
      location: 'Zurich, Switzerland',
      type: 'commodity',
      submittedBy: '0xabcd...ef01',
      submittedAt: '2026-01-04T14:20:00Z',
      status: 'pending',
      documents: {
        titleDeed: true,
        valuationReport: true,
        legalOpinion: true,
      },
    },
  ]);
  
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  
  const handleApprove = (id: string) => {
    setSubmissions(
      submissions.map((s) =>
        s.id === id ? { ...s, status: 'approved' } : s
      )
    );
    setSelectedSubmission(null);
  };
  
  const handleReject = (id: string) => {
    setSubmissions(
      submissions.map((s) =>
        s.id === id ? { ...s, status: 'rejected' } : s
      )
    );
    setSelectedSubmission(null);
  };
  
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');
  const reviewedSubmissions = submissions.filter((s) => s.status !== 'pending');
  
  return (
    <Layout title="Admin Panel" showBack>
      <div className="px-4 py-6 space-y-6">
        {/* Admin Badge */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-blue-400">Administrator Access</p>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                Review and manage asset submissions
              </p>
            </div>
          </div>
        </Card>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <div className="space-y-1">
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Pending</p>
              <p className="text-2xl font-semibold text-amber-400">
                {pendingSubmissions.length}
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="space-y-1">
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Approved</p>
              <p className="text-2xl font-semibold text-green-400">
                {submissions.filter((s) => s.status === 'approved').length}
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="space-y-1">
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Rejected</p>
              <p className="text-2xl font-semibold text-red-400">
                {submissions.filter((s) => s.status === 'rejected').length}
              </p>
            </div>
          </Card>
        </div>
        
        {/* Pending Submissions */}
        {pendingSubmissions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-3 px-1">
              Pending Review ({pendingSubmissions.length})
            </h3>
            
            <div className="space-y-3">
              {pendingSubmissions.map((submission) => (
                <Card key={submission.id} padding="none">
                  <div className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{submission.assetName}</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-2">
                          {submission.location}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="neutral" size="sm">
                            {submission.type.toUpperCase()}
                          </Badge>
                          <Badge variant="warning" size="sm">
                            Pending Review
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-[rgb(var(--color-border))] space-y-2">
                      <div className="text-sm">
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">
                          Documents:
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[rgb(var(--color-text-secondary))]">
                              Title Deed
                            </span>
                            {submission.documents.titleDeed ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[rgb(var(--color-text-secondary))]">
                              Valuation Report
                            </span>
                            {submission.documents.valuationReport ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[rgb(var(--color-text-secondary))]">
                              Legal Opinion
                            </span>
                            {submission.documents.legalOpinion ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                        <p>
                          Submitted by{' '}
                          <span className="font-mono">{submission.submittedBy}</span>
                        </p>
                        <p>
                          {new Date(submission.submittedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission.id)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(submission.id)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(submission.id)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Reviewed Submissions */}
        {reviewedSubmissions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-3 px-1">
              Reviewed ({reviewedSubmissions.length})
            </h3>
            
            <div className="space-y-2">
              {reviewedSubmissions.map((submission) => (
                <Card key={submission.id} padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1">{submission.assetName}</p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                        {submission.location}
                      </p>
                    </div>
                    <Badge
                      variant={submission.status === 'approved' ? 'success' : 'error'}
                      size="sm"
                    >
                      {submission.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {submissions.length === 0 && (
          <Card className="text-center py-12">
            <Activity className="w-12 h-12 text-[rgb(var(--color-text-secondary))] mx-auto mb-4" />
            <h3 className="font-medium mb-2">No submissions yet</h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              Asset submissions will appear here for review
            </p>
          </Card>
        )}
        
        {/* Activity Log */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <h3 className="font-medium">Recent Activity</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
                <span className="text-[rgb(var(--color-text-secondary))]">Last login</span>
                <span>2026-01-06 08:30</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Submissions reviewed
                </span>
                <span>{reviewedSubmissions.length}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
