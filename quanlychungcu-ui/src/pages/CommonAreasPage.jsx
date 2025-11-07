import React, { useState, useEffect, useCallback } from 'react';
// Import các Service mới
import { commonAreaService } from '../services/commonAreaService';
import { incidentService } from '../services/incidentService';
import { inspectionService } from '../services/inspectionService';
// Import các Component "ngốc"
import CommonAreaList from '../components/CommonAreaList';
import IncidentList from '../components/IncidentList';
import InspectionList from '../components/InspectionList';

function CommonAreasPage() {
    // State cho 3 danh sách
    const [areas, setAreas] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [inspections, setInspections] = useState([]);
    
    // State loading/error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch 3 API song song
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [areasData, incidentsData, inspectionsData] = await Promise.all([
                commonAreaService.getAll(),
                incidentService.getAll(),
                inspectionService.getAll()
            ]);
            setAreas(areasData);
            setIncidents(incidentsData);
            setInspections(inspectionsData);
        } catch (err) {
            setError(err.message || "Lỗi khi tải dữ liệu Kỹ thuật.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>🏞️ Quản lý Kỹ thuật & Khu vực chung</h2>
                <button className="btn-add-new">+ Quản lý Kỹ thuật</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Truyền props xuống các component "ngốc" */}
            <CommonAreaList areas={areas} isLoading={loading} />
            <IncidentList incidents={incidents} isLoading={loading} />
            <InspectionList inspections={inspections} isLoading={loading} />
        </div>
    );
}

export default CommonAreasPage;