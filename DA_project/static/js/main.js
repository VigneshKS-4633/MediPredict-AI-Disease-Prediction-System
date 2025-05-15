$(document).ready(function() {
    // Initialize Select2 with custom options
    $('#symptoms').select2({
        placeholder: 'Type or click to select symptoms',
        maximumSelectionLength: 10,
        width: '100%',
        theme: 'classic',
        tags: false,
        tokenSeparators: [',', ' '],
        closeOnSelect: false,
        allowClear: true
    });

    // Smooth scroll for navigation links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.hash);
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 70
            }, 800);
        }
    });

    // Handle form submission
    $('#prediction-form').on('submit', function(e) {
        e.preventDefault();
        
        const symptoms = $('#symptoms').val();
        
        if (!symptoms || symptoms.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Symptoms Selected',
                text: 'Please select at least one symptom to proceed.',
                confirmButtonColor: '#0d6efd'
            });
            return;
        }

        // Show loading state
        const submitBtn = $('button[type="submit"]');
        submitBtn.prop('disabled', true).html(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Analyzing Symptoms...
        `);

        // Hide previous results with fade out
        $('#results').fadeOut(300);

        // Send AJAX request
        $.ajax({
            url: '/predict',
            method: 'POST',
            data: {
                'symptoms[]': symptoms
            },
            success: function(response) {
                if (response.error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.error,
                        confirmButtonColor: '#0d6efd'
                    });
                    return;
                }

                // Update results with animations
                setTimeout(() => {
                    updateResults(response);
                    $('#results').fadeIn(500).addClass('show');
                    
                    // Smooth scroll to results on mobile
                    if (window.innerWidth < 768) {
                        $('html, body').animate({
                            scrollTop: $('#results').offset().top - 20
                        }, 800);
                    }
                }, 500);
            },
            error: function() {
                Swal.fire({
                    icon: 'error',
                    title: 'Server Error',
                    text: 'An error occurred while processing your request. Please try again.',
                    confirmButtonColor: '#0d6efd'
                });
            },
            complete: function() {
                // Reset button state with delay for better UX
                setTimeout(() => {
                    submitBtn.prop('disabled', false).html(`
                        <i class="fas fa-search me-2"></i>
                        Predict Disease
                    `);
                }, 500);
            }
        });
    });

    function updateResults(response) {
        // Update selected symptoms with animation
        $('#selected-symptoms').fadeOut(200, function() {
            $(this).text(
                response.selected_symptoms
                    .map(s => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
                    .join(', ')
            ).fadeIn(200);
        });

        // Update predictions with animation
        $('#primary-prediction').fadeOut(200, function() {
            $(this).text(response.dt_prediction).fadeIn(200);
        });
        
        if (response.dt_prediction === response.svm_prediction) {
            $('#alternative-prediction').fadeOut(200, function() {
                $(this).text('Confirms ' + response.svm_prediction)
                    .removeClass('text-warning')
                    .addClass('text-success')
                    .fadeIn(200);
            });
        } else {
            $('#alternative-prediction').fadeOut(200, function() {
                $(this).text(response.svm_prediction)
                    .removeClass('text-success')
                    .addClass('text-warning')
                    .fadeIn(200);
            });
        }

        // Update severity bar with animation
        const severityPercentage = (response.severity / 10) * 100;
        $('#severity-bar').css('width', '0%').removeClass('bg-success bg-warning bg-danger');
        
        setTimeout(() => {
            $('#severity-bar').css('width', severityPercentage + '%');
            if (severityPercentage < 33) {
                $('#severity-bar').addClass('bg-success');
            } else if (severityPercentage < 66) {
                $('#severity-bar').addClass('bg-warning');
            } else {
                $('#severity-bar').addClass('bg-danger');
            }
        }, 100);

        $('#severity-text').text(response.severity + '/10');

        // Update disease information with animation
        $('#disease-description').fadeOut(200, function() {
            $(this).text(response.description).fadeIn(200);
        });
        
        // Update precautions with animation
        const precautionsList = $('#precautions-list');
        precautionsList.empty();
        
        response.precautions.forEach(function(precaution, index) {
            const li = $(`
                <li class="list-group-item" style="display: none;">
                    <i class="fas fa-check-circle text-success me-2"></i>
                    ${precaution}
                </li>
            `);
            precautionsList.append(li);
            li.delay(index * 100).fadeIn(300);
        });
    }

    // Add hover effect to cards
    $('.card').hover(
        function() { $(this).addClass('shadow-lg'); },
        function() { $(this).removeClass('shadow-lg'); }
    );
}); 