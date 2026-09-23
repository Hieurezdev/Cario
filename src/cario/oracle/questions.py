"""Versioned seed content; the running API reads questions from MongoDB."""

VERSION = 2
DIMENSIONS = ("logic", "creativity", "empathy", "leadership", "curiosity", "collaboration")
DIMENSION_LABELS = {
    "logic": "Tư duy logic",
    "creativity": "Sáng tạo",
    "empathy": "Đồng cảm",
    "leadership": "Dẫn dắt",
    "curiosity": "Tò mò học hỏi",
    "collaboration": "Hợp tác",
}


def question(key: str, chapter: str, scenario: str, prompt: str, choices: list[tuple[str, str, str]]) -> dict:
    return {
        "key": key,
        "version": VERSION,
        "order": len(QUESTION_BANK) + 1,
        "chapter": chapter,
        "scenario": scenario,
        "prompt": prompt,
        "options": [
            {"id": chr(65 + index), "text": text, "weights": {primary: 2, secondary: 1}}
            for index, (text, primary, secondary) in enumerate(choices)
        ],
    }


QUESTION_BANK: list[dict] = []


def add(key: str, chapter: str, scenario: str, prompt: str, choices: list[tuple[str, str, str]]) -> None:
    QUESTION_BANK.append(question(key, chapter, scenario, prompt, choices))


add("launch-feedback", "Sản phẩm số", "Nhóm của bạn chuẩn bị ra mắt website cho một câu lạc bộ. Người dùng thử nói họ không tìm thấy nút đăng ký.", "Bạn sẽ làm gì trước?", [
    ("Xem lại hành trình và số lần người dùng dừng ở từng bước.", "logic", "curiosity"),
    ("Hỏi người dùng thử họ đã mong đợi nút đó xuất hiện ở đâu.", "empathy", "curiosity"),
    ("Phác nhanh hai cách đặt nút rồi đem thử lại.", "creativity", "logic"),
    ("Mời nhóm thống nhất việc cần sửa trước giờ ra mắt.", "leadership", "collaboration"),
])
add("conflicting-data", "Dữ liệu", "Hai bảng số liệu về cùng một sự kiện cho kết quả khác nhau, trong khi nhóm cần báo cáo vào ngày mai.", "Bạn chọn bước tiếp theo nào?", [
    ("Đối chiếu nguồn, cách lọc và đơn vị đo của từng bảng.", "logic", "curiosity"),
    ("Nói rõ mức độ chưa chắc chắn để mọi người không dùng nhầm số.", "empathy", "leadership"),
    ("Tìm một cách trực quan để trình bày cả hai giả thuyết.", "creativity", "logic"),
    ("Chia việc kiểm tra dữ liệu và hẹn thời điểm chốt chung.", "collaboration", "leadership"),
])
add("quiet-teammate", "Làm việc nhóm", "Một thành viên vốn làm tốt bỗng ít nói và nộp phần việc muộn trong hai tuần.", "Bạn sẽ bắt đầu bằng cách nào?", [
    ("Trao đổi riêng để hiểu điều gì đang gây khó cho bạn ấy.", "empathy", "collaboration"),
    ("Rà lại khối lượng và các mốc công việc của cả nhóm.", "logic", "leadership"),
    ("Đề xuất chia lại việc để mọi người có thể hỗ trợ nhau.", "collaboration", "creativity"),
    ("Hỏi bạn ấy muốn thử một vai trò khác trong dự án không.", "curiosity", "empathy"),
])
add("local-campaign", "Truyền thông", "Một hợp tác xã có sản phẩm tốt nhưng chỉ có ngân sách rất nhỏ để giới thiệu tới sinh viên.", "Bạn đề xuất hướng mở đầu nào?", [
    ("Tìm hiểu sinh viên đang gặp vấn đề gì mà sản phẩm giải quyết được.", "curiosity", "empathy"),
    ("Thiết kế một ý tưởng kể chuyện có thể lan truyền tự nhiên.", "creativity", "empathy"),
    ("Thử một thông điệp nhỏ và theo dõi phản hồi trước khi mở rộng.", "logic", "creativity"),
    ("Kết nối câu lạc bộ và nhóm địa phương để cùng thực hiện.", "collaboration", "leadership"),
])
add("broken-prototype", "Sản phẩm số", "Bản thử nghiệm của nhóm gặp lỗi ngay trước buổi trình bày.", "Bạn ưu tiên việc nào?", [
    ("Khoanh vùng lỗi và xác định chức năng còn chạy ổn định.", "logic", "curiosity"),
    ("Phân công một người sửa, một người chuẩn bị phương án dự phòng.", "leadership", "collaboration"),
    ("Biến phần còn dùng được thành một câu chuyện minh họa rõ ràng.", "creativity", "leadership"),
    ("Báo sớm cho người xem về giới hạn của bản thử nghiệm.", "empathy", "collaboration"),
])
add("unexpected-pattern", "Dữ liệu", "Trong dự án dữ liệu, bạn thấy một xu hướng lạ không nằm trong câu hỏi ban đầu.", "Bạn làm gì với phát hiện đó?", [
    ("Kiểm tra xem xu hướng có phải do lỗi dữ liệu hay không.", "logic", "curiosity"),
    ("Đặt thêm câu hỏi để hiểu điều gì có thể tạo ra xu hướng ấy.", "curiosity", "logic"),
    ("Phác một cách kể chuyện để nhóm dễ nhìn thấy phát hiện.", "creativity", "collaboration"),
    ("Hỏi người liên quan liệu xu hướng ấy có ý nghĩa với họ không.", "empathy", "collaboration"),
])
add("team-conflict", "Làm việc nhóm", "Hai bạn trong nhóm đều có ý tưởng tốt nhưng tranh luận khiến công việc đứng lại.", "Bạn sẽ làm gì?", [
    ("Để từng bạn trình bày điều họ muốn giải quyết và điều họ lo ngại.", "empathy", "leadership"),
    ("Đặt tiêu chí chung để so sánh hai phương án.", "logic", "collaboration"),
    ("Thử ghép phần mạnh của cả hai thành một bản mẫu nhỏ.", "creativity", "collaboration"),
    ("Chốt một thử nghiệm ngắn với thời hạn và người phụ trách rõ ràng.", "leadership", "logic"),
])
add("new-tool", "Học hỏi", "Một công cụ mới có thể rút ngắn công việc, nhưng cả nhóm chưa từng sử dụng.", "Bạn chọn cách tiếp cận nào?", [
    ("Thử một nhiệm vụ nhỏ để xem công cụ phù hợp tới đâu.", "curiosity", "logic"),
    ("Tìm người đã dùng và hỏi về những lỗi thường gặp.", "collaboration", "curiosity"),
    ("Đề xuất cách kết hợp công cụ mới với quy trình hiện tại.", "creativity", "leadership"),
    ("Lập tiêu chí hiệu quả rồi so với cách làm cũ.", "logic", "leadership"),
])
add("accessibility", "Thiết kế", "Một bạn dùng điện thoại cũ nói giao diện bạn làm tải chậm và khó đọc.", "Bạn làm gì đầu tiên?", [
    ("Quan sát bạn ấy sử dụng để hiểu rõ điểm vướng.", "empathy", "curiosity"),
    ("Đo thời gian tải và kiểm tra kích cỡ chữ, độ tương phản.", "logic", "empathy"),
    ("Thiết kế một bản nhẹ hơn, ưu tiên nội dung cần thiết.", "creativity", "logic"),
    ("Trao đổi với nhóm để đưa khả năng tiếp cận vào tiêu chí chung.", "leadership", "collaboration"),
])
add("community-event", "Cộng đồng", "Câu lạc bộ muốn tổ chức một buổi chia sẻ nghề nghiệp nhưng chưa biết sinh viên thật sự muốn hỏi gì.", "Bạn chọn việc đầu tiên nào?", [
    ("Hỏi một nhóm sinh viên ở các năm học khác nhau.", "empathy", "curiosity"),
    ("Tổng hợp câu hỏi cũ và tìm chủ đề xuất hiện nhiều nhất.", "logic", "curiosity"),
    ("Thử một hình thức hỏi đáp ngắn, dễ tham gia.", "creativity", "empathy"),
    ("Rủ các nhóm chuyên môn cùng chọn chủ đề và người chia sẻ.", "collaboration", "leadership"),
])
add("deadline-tradeoff", "Dự án", "Dự án còn ba ngày; nhóm không thể hoàn thành mọi tính năng đã hứa.", "Bạn xử lý ra sao?", [
    ("Xếp tính năng theo tác động và công sức để giữ phần quan trọng.", "logic", "leadership"),
    ("Nói rõ tình hình với người nhận sản phẩm và hỏi ưu tiên của họ.", "empathy", "collaboration"),
    ("Đề xuất phiên bản gọn vẫn cho thấy ý tưởng cốt lõi.", "creativity", "leadership"),
    ("Thống nhất lại việc với từng thành viên và thời điểm bàn giao.", "collaboration", "leadership"),
])
add("unfamiliar-field", "Khám phá nghề", "Bạn được mời thử một dự án thuộc lĩnh vực chưa từng học, nhưng thấy vấn đề khá thú vị.", "Bạn bắt đầu thế nào?", [
    ("Đọc tài liệu nhập môn rồi viết ra những điều chưa hiểu.", "curiosity", "logic"),
    ("Tìm một người trong lĩnh vực để hỏi về công việc thực tế.", "collaboration", "curiosity"),
    ("Thử tạo một sản phẩm nhỏ để học qua việc làm.", "creativity", "curiosity"),
    ("Trao đổi kỳ vọng và giới hạn hiện tại trước khi nhận việc.", "empathy", "leadership"),
])
add("feedback-on-work", "Phản hồi", "Một cố vấn góp ý rằng bài làm của bạn chưa đủ rõ, nhưng bạn đã dành nhiều thời gian cho nó.", "Bạn phản ứng thế nào?", [
    ("Hỏi cố vấn phần nào khiến họ khó hiểu nhất.", "curiosity", "empathy"),
    ("Xem lại mục tiêu và bằng chứng để tìm chỗ lập luận thiếu.", "logic", "curiosity"),
    ("Thử trình bày lại cùng nội dung bằng một hình thức khác.", "creativity", "logic"),
    ("Nhờ một bạn khác đọc để so sánh cách họ hiểu bài.", "collaboration", "empathy"),
])
add("remote-collaboration", "Làm việc nhóm", "Nhóm làm việc từ xa; mỗi người hiểu bản yêu cầu theo một cách khác nhau.", "Bạn chọn cách gỡ rối nào?", [
    ("Viết lại các yêu cầu thành ví dụ có thể kiểm tra được.", "logic", "collaboration"),
    ("Tổ chức cuộc trao đổi ngắn để mọi người nói cách họ hiểu.", "collaboration", "empathy"),
    ("Vẽ một luồng trải nghiệm chung cho cả nhóm góp ý.", "creativity", "collaboration"),
    ("Chốt người quyết định từng phần và thời hạn phản hồi.", "leadership", "logic"),
])
add("sensitive-story", "Truyền thông", "Bạn muốn kể câu chuyện của một người thật trong chiến dịch cộng đồng; chi tiết ấy có thể khiến họ bị nhận ra.", "Bạn làm gì?", [
    ("Xin ý kiến người đó và hỏi họ muốn giữ riêng điều gì.", "empathy", "leadership"),
    ("Thay chi tiết nhận diện bằng một câu chuyện tổng hợp.", "creativity", "empathy"),
    ("Rà lại dữ kiện nào thật sự cần thiết cho thông điệp.", "logic", "empathy"),
    ("Cùng nhóm xây nguyên tắc dùng câu chuyện cá nhân.", "collaboration", "leadership"),
])
add("volunteer-dropoff", "Cộng đồng", "Dự án tình nguyện có nhiều người đăng ký nhưng ít người tiếp tục sau tuần đầu.", "Bạn muốn tìm hiểu điều gì trước?", [
    ("Nhìn từng bước tham gia để tìm lúc mọi người rời đi.", "logic", "curiosity"),
    ("Hỏi người đã rời đi về trải nghiệm và trở ngại của họ.", "empathy", "curiosity"),
    ("Thử một hoạt động mở đầu ngắn hơn, rõ kết quả hơn.", "creativity", "empathy"),
    ("Rủ các nhóm trưởng cùng sửa cách đón thành viên mới.", "leadership", "collaboration"),
])
add("first-lead", "Dẫn dắt", "Lần đầu điều phối một nhóm, bạn có hai bạn giàu kinh nghiệm hơn mình.", "Bạn bắt đầu buổi làm việc thế nào?", [
    ("Mời mọi người nêu thế mạnh và việc muốn nhận.", "collaboration", "empathy"),
    ("Làm rõ mục tiêu, giới hạn và mốc cần đạt.", "leadership", "logic"),
    ("Hỏi hai bạn kinh nghiệm về rủi ro mình chưa thấy.", "curiosity", "collaboration"),
    ("Phác vài cách tổ chức để cả nhóm cùng chọn.", "creativity", "leadership"),
])
add("impact-report", "Tác động", "Sau một tháng làm dự án địa phương, mọi người hỏi dự án đã giúp ích gì.", "Bạn muốn trình bày kết quả theo cách nào?", [
    ("Đối chiếu số liệu trước và sau với mục tiêu ban đầu.", "logic", "leadership"),
    ("Kể một trải nghiệm cụ thể của người đã sử dụng kết quả.", "empathy", "creativity"),
    ("Làm một bản trực quan ngắn để nhiều người cùng hiểu.", "creativity", "collaboration"),
    ("Mời đối tác và cả nhóm cùng nhìn lại điều nên làm tiếp.", "collaboration", "curiosity"),
])
